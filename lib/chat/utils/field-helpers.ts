import { getPracticeAreaConfig, getFieldQuestion, getChatFlow } from '../config/practice-areas-loader';

/**
 * Get list of all required field names for a practice area
 */
export function getRequiredFieldsList(category: string): string[] {
  const practiceArea = getPracticeAreaConfig(category);
  if (!practiceArea) return [];
  
  return Object.entries(practiceArea.required_fields)
    .filter(([fieldName, config]) => {
      // Only include required fields
      if (config.required !== true) return false;
      
      // Exclude auto-populated fields
      if (config.source === 'config' || config.source === 'server' || 
          config.source === 'tracking' || config.source === 'compliance') return false;
      
      // Don't include fields that are auto-populated by the system
      if (fieldName === 'sub_category' || fieldName === 'city' || fieldName === 'state') {
        return false;
      }
      
      return true;
    })
    .map(([fieldName, _]) => fieldName);
}

/**
 * Get list of missing required fields
 */
export function getMissingRequiredFields(category: string, collectedFields: Record<string, any>): string[] {
  const requiredFields = getRequiredFieldsList(category);
  return requiredFields.filter(field => !collectedFields[field] || collectedFields[field] === '');
}

/**
 * Get the next field to collect based on chat flow order
 */
export function getNextFieldInFlow(category: string, collectedFields: Record<string, any>): string | null {
  const chatFlow = getChatFlow(category);
  if (!chatFlow || chatFlow.length === 0) return null;
  
  // Sort by order
  const sortedFlow = chatFlow.sort((a, b) => a.order - b.order);
  
  // Find first missing field in order
  for (const flowItem of sortedFlow) {
    if (!collectedFields[flowItem.field] || collectedFields[flowItem.field] === '') {
      return flowItem.field;
    }
  }
  
  return null;
}

/**
 * Check if all required fields are collected
 */
export function isAllRequiredFieldsCollected(category: string, collectedFields: Record<string, any>): boolean {
  const missingFields = getMissingRequiredFields(category, collectedFields);
  return missingFields.length === 0;
}

/**
 * Get a formatted question for a field, with template variables replaced
 */
export function getFormattedQuestion(category: string, field: string, collectedFields: Record<string, any> = {}): string {
  let question = getFieldQuestion(category, field);
  if (!question) {
    return `What is your ${field.replace(/_/g, ' ')}?`;
  }
  
  // Replace template variables
  question = question.replace(/{first_name}/g, collectedFields.first_name || '');
  question = question.replace(/{name_prefix}/g, collectedFields.first_name ? `${collectedFields.first_name}, ` : '');
  question = question.replace(/{compassionate_intro}/g, getCompassionateIntro(category));
  
  return question;
}

/**
 * Get compassionate intro for a category
 */
function getCompassionateIntro(category: string): string {
  const practiceArea = getPracticeAreaConfig(category);
  return practiceArea?.personality?.compassionate_intro || "I'm here to help you find the right attorney.";
}

/**
 * Detect practice area from user message using AI with keyword fallback
 */
export async function detectPracticeArea(message: string): Promise<{
  category: string | null;
  subCategory?: string | null;
  confidence?: 'high' | 'medium' | 'low';
}> {
  try {
    // Import AI detection dynamically to avoid circular dependencies
    const { detectPracticeAreaWithAI, detectPracticeAreaWithKeywords } = await import('./ai-practice-area-detector');
    
    // Try AI detection first
    const aiResult = await detectPracticeAreaWithAI(message);
    
    // Only use AI result if confidence is HIGH
    if (aiResult.confidence === 'high') {
      return {
        category: aiResult.main_category,
        subCategory: aiResult.sub_category,
        confidence: 'high'
      };
    }
    
    // Fall back to keyword matching for medium/low confidence
    const keywordResult = detectPracticeAreaWithKeywords(message);
    return {
      category: keywordResult,
      confidence: keywordResult ? 'medium' : 'low'
    };
    
  } catch (error) {
    // If AI fails, use keyword fallback
    console.warn('AI detection failed, using keyword fallback', error);
    const { detectPracticeAreaWithKeywords } = await import('./ai-practice-area-detector');
    return {
      category: detectPracticeAreaWithKeywords(message),
      confidence: 'medium'
    };
  }
}

/**
 * Legacy synchronous version for backward compatibility
 * @deprecated Use the async version instead
 */
export function detectPracticeAreaSync(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Personal injury keywords
  if (lowerMessage.includes('injury') || 
      lowerMessage.includes('accident') || 
      lowerMessage.includes('hurt') || 
      lowerMessage.includes('car accident') ||
      lowerMessage.includes('slip and fall') ||
      lowerMessage.includes('workplace injury')) {
    return 'personal_injury_law';
  }
  
  // Family law keywords
  if (lowerMessage.includes('divorce') || 
      lowerMessage.includes('family') || 
      lowerMessage.includes('custody') ||
      lowerMessage.includes('child support')) {
    return 'family_law';
  }
  
  // Criminal defense keywords
  if (lowerMessage.includes('criminal') || 
      lowerMessage.includes('arrest') || 
      lowerMessage.includes('charges') ||
      lowerMessage.includes('court')) {
    return 'criminal_defense';
  }
  
  // Social Security Disability keywords
  if (lowerMessage.includes('social security') || 
      lowerMessage.includes('disability') || 
      lowerMessage.includes('ssdi') ||
      lowerMessage.includes('ssi') ||
      lowerMessage.includes('disability benefits') ||
      lowerMessage.includes('can\'t work') ||
      lowerMessage.includes('unable to work') ||
      lowerMessage.includes('chronic pain') ||
      lowerMessage.includes('medical condition')) {
    return 'social_security_disability';
  }
  
  return null;
}

/**
 * Get list of remaining fields that could be extracted opportunistically
 */
export function getRemainingFields(category: string, collectedFields: Record<string, any>): string[] {
  const practiceArea = getPracticeAreaConfig(category);
  if (!practiceArea) return [];
  
  return Object.entries(practiceArea.required_fields)
    .filter(([fieldName, config]) => {
      // Only include fields that are required and not already collected
      if (config.required !== true || (collectedFields[fieldName] && collectedFields[fieldName] !== '')) {
        return false;
      }
      
      // CRITICAL: Exclude config and server-sourced fields from AI extraction
      // These fields should never be extracted from user input
      if (config.source === 'config' || config.source === 'server') {
        return false;
      }
      
      return true;
    })
    .map(([fieldName, _]) => fieldName);
}

/**
 * Extract and validate field value based on field type
 */
export function extractFieldValue(fieldName: string, value: string, category: string): string | null {
  const practiceArea = getPracticeAreaConfig(category);
  if (!practiceArea) return value;
  
  const fieldConfig = practiceArea.required_fields[fieldName];
  if (!fieldConfig) return value;
  
  // Basic validation based on field type
  switch (fieldConfig.type) {
    case 'email':
      if (!value.includes('@')) return null;
      break;
    case 'phone':
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) return null;
      return digits;
    case 'zip':
      const zipDigits = value.replace(/\D/g, '');
      if (zipDigits.length !== 5 && zipDigits.length !== 9) return null;
      return zipDigits;
    case 'date':
      // Basic date validation - could be enhanced
      if (!value.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) return null;
      break;
  }
  
  return value;
}
