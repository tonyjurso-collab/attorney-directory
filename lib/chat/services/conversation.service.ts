import { ChatSessionData } from '../config/schemas';
import { getPracticeAreaBySlug, getFieldQuestion, getCompassionateIntro, getChatFlow } from '../config/practice-areas-loader';
import { logger } from '@/lib/logging/logger';

export interface ConversationResponse {
  reply: string;
  fieldAsked?: string;
  complete: boolean;
}

export class ConversationService {
  /**
   * Get the next response in the conversation flow
   */
  async getNextResponse(session: ChatSessionData): Promise<ConversationResponse> {
    const practiceArea = session.main_category ? getPracticeAreaBySlug(session.main_category) : null;
    
    if (!practiceArea) {
      return this.getGenericResponse(session);
    }

    // Get required fields with chat flow order
    const chatFlow = getChatFlow(session.main_category || 'general_legal_assistance');
    const requiredFieldsConfig = practiceArea.required_fields || {};
    
    // Get all required fields (excluding server/config/tracking/compliance sourced fields)
    const requiredFields = Object.entries(requiredFieldsConfig)
      .filter(([fieldName, field]) => {
        const fieldConfig = field as any;
        // Skip auto-populated fields from various sources
        if (fieldConfig.source === 'server' || fieldConfig.source === 'config' || 
            fieldConfig.source === 'tracking' || fieldConfig.source === 'compliance') {
          return false;
        }
        
        // Don't ask for fields that are auto-populated by the system
        if (fieldName === 'sub_category' || fieldName === 'city' || fieldName === 'state') {
          return false;
        }
        
        // Only include required fields
        return fieldConfig.required === true;
      })
      .map(([fieldName, field]) => ({ name: fieldName, ...(field as any) }));
    
    const collectedFields = requiredFields.filter(field => 
      session.answers[field.name] && session.answers[field.name] !== ''
    );

    if (collectedFields.length >= requiredFields.length) {
      return this.getCompletionResponse(session, practiceArea);
    }

    // Use chat flow order to find the next field
    let nextField = null;
    
    if (chatFlow && chatFlow.length > 0) {
      // Sort by order
      const sortedFlow = [...chatFlow].sort((a, b) => a.order - b.order);
      
      // Find first missing field in flow order
      for (const flowItem of sortedFlow) {
        const fieldConfig = requiredFields.find(f => f.name === flowItem.field);
        if (fieldConfig && (!session.answers[fieldConfig.name] || session.answers[fieldConfig.name] === '')) {
          nextField = fieldConfig;
          break;
        }
      }
    } else {
      // Fall back to finding any missing field
      nextField = requiredFields.find(field => 
        !session.answers[field.name] || session.answers[field.name] === ''
      );
    }

    if (nextField) {
      return this.getFieldQuestion(session, nextField, practiceArea);
    }

    return this.getGenericResponse(session);
  }

  private getGenericResponse(session: ChatSessionData): ConversationResponse {
    if (!session.main_category) {
      return {
        reply: "I'd be happy to help you find legal assistance. Can you tell me what type of legal issue you're facing?",
        complete: false,
      };
    }

    return {
      reply: "I understand you're looking for legal help. Let me ask you a few questions to connect you with the right attorney.",
      complete: false,
    };
  }

  private getFieldQuestion(
    session: ChatSessionData, 
    field: any,
    practiceArea: any
  ): ConversationResponse {
    // Use the field question from practice area config
    let question = getFieldQuestion(session.main_category!, field.name);
    
    // If no config question found, fall back to basic question
    if (!question) {
      question = `Please provide your ${field.name.replace(/_/g, ' ')}`;
    }
    
    // Replace template variables in the question
    if (session.answers.first_name) {
      question = question.replace(/{name_prefix}/g, `${session.answers.first_name}, `);
      question = question.replace(/{first_name}/g, session.answers.first_name);
    } else {
      question = question.replace(/{name_prefix}/g, '');
      question = question.replace(/{first_name}/g, '');
    }
    
    // Replace compassionate intro if present
    const compassionateIntro = getCompassionateIntro(session.main_category!);
    question = question.replace(/{compassionate_intro}/g, compassionateIntro);

    return {
      reply: question,
      fieldAsked: field.name,
      complete: false,
    };
  }

  private getCompletionResponse(session: ChatSessionData, practiceArea: any): ConversationResponse {
    const categoryName = practiceArea.name || session.main_category?.replace(/_/g, ' ') || 'attorneys';
    let namePrefix = '';
    
    if (session.answers.first_name) {
      namePrefix = `${session.answers.first_name}, `;
    }
    
    const reply = `Excellent! ${namePrefix}I have all the information I need to connect you with qualified ${categoryName} attorneys in your area. Would you like me to submit your information?`;

    return {
      reply,
      complete: true,
    };
  }
}