import { getRequiredFieldsForCategory, getQuestionForField } from './legal-intake-config';
import { getCityStateFromZipCode } from '@/lib/utils/zipcode-geocoding';

export interface ConversationFlowResult {
  hasNext: boolean;
  field?: string;
  question?: string;
  totalFields: number;
  collectedFields: Record<string, any>;
  category: string;
}

export function getNextQuestion(
  collectedFields: Record<string, any>,
  category: string,
  conversationHistory: Array<{role: string; content: string}> = []
): ConversationFlowResult {
  const requiredFields = getRequiredFieldsForCategory(category);
  
  console.log('Checking required fields:', {
    category,
    requiredFields,
    collected: Object.keys(collectedFields),
    missing: requiredFields.filter(f => {
      const value = collectedFields[f];
      return value === undefined || value === null || value === '' || 
             (typeof value === 'string' && value.trim() === '');
    })
  });

  // Auto-populate city and state if zip_code is available
  // Note: getCityStateFromZipCode is async, so this is handled elsewhere
  // This function is synchronous, so we can't await here

  // Find the first missing required field
  const missingField = requiredFields.find(field => {
    const value = collectedFields[field];
    return value === undefined || value === null || value === '' || 
           (typeof value === 'string' && value.trim() === '');
  });

  if (!missingField) {
    return {
      hasNext: false,
      totalFields: requiredFields.length,
      collectedFields,
      category
    };
  }

  // Generate question for the missing field
  const question = getQuestionForField(category, missingField, {
    ...collectedFields,
    category,
    subcategory: collectedFields.sub_category
  });

  return {
    hasNext: true,
    field: missingField,
    question,
    totalFields: requiredFields.length,
    collectedFields,
    category
  };
}

export function validateRequiredFields(
  collectedFields: Record<string, any>,
  category: string
): { isValid: boolean; missingFields: string[] } {
  const requiredFields = getRequiredFieldsForCategory(category);
  
  const missingFields = requiredFields.filter(field => {
    const value = collectedFields[field];
    return value === undefined || value === null || value === '' || 
           (typeof value === 'string' && value.trim() === '');
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function getFieldValidationRules(field: string, category: string) {
  // Basic validation rules for common fields
  const rules: Record<string, any> = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^[\d\s\(\)\-\+]+$/,
      message: 'Please enter a valid phone number'
    },
    zip_code: {
      pattern: /^\d{5}(-\d{4})?$/,
      message: 'Please enter a valid ZIP code'
    }
  };

  return rules[field] || null;
}
