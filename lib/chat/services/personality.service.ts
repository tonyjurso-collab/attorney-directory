import { ChatSessionData } from '../config/schemas';
import { logger } from '@/lib/logging/logger';

export class PersonalityService {
  /**
   * Generate a personalized response based on the session context
   */
  async generateResponse(session: ChatSessionData, fieldAsked?: string): Promise<string> {
    // This is a placeholder implementation
    // In a more sophisticated system, this would use AI to generate personalized responses
    
    const personalityTraits = {
      empathetic: true,
      professional: true,
      encouraging: true,
    };

    let baseResponse = "";

    if (fieldAsked) {
      baseResponse = this.getFieldSpecificResponse(fieldAsked, session);
    } else {
      baseResponse = this.getGenericResponse(session);
    }

    return this.applyPersonality(baseResponse, personalityTraits);
  }

  private getFieldSpecificResponse(fieldAsked: string, session: ChatSessionData): string {
    const responses: Record<string, string> = {
      first_name: "I'd be happy to help you find the right attorney. What's your first name?",
      last_name: "Thank you! What's your last name?",
      phone: "Great! What's the best phone number to reach you?",
      email: "Perfect! What's your email address?",
      zip_code: "What's your ZIP code? This helps us find attorneys in your area.",
      description: "Can you tell me more about your situation?",
    };

    return responses[fieldAsked] || "I need a bit more information to help you.";
  }

  private getGenericResponse(session: ChatSessionData): string {
    if (!session.main_category) {
      return "I'm here to help you find the right legal assistance. What type of legal issue are you facing?";
    }

    return "I understand you're looking for legal help. Let me ask you a few questions to connect you with the right attorney.";
  }

  private applyPersonality(response: string, traits: any): string {
    // Simple personality application - in a real system, this would be more sophisticated
    if (traits.empathetic) {
      response = response.replace(/I need/, "I'd like to get");
      response = response.replace(/Can you/, "Could you please");
    }

    if (traits.encouraging) {
      response = response.replace(/I need/, "I'd appreciate");
    }

    return response;
  }
}