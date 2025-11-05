import { getCityStateFromZipCode } from '@/lib/utils/zipcode-geocoding';
import fs from 'fs';
import path from 'path';

export function getNextQuestion(
  collectedFields: Record<string, any>,
  category: string
): { question: string; field: string } | null {
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
  
  // Debug specific fields
  console.log('Field validation details:', {
    bodily_injury: { value: collectedFields.bodily_injury, type: typeof collectedFields.bodily_injury, isEmpty: !collectedFields.bodily_injury },
    at_fault: { value: collectedFields.at_fault, type: typeof collectedFields.at_fault, isEmpty: !collectedFields.at_fault },
    has_attorney: { value: collectedFields.has_attorney, type: typeof collectedFields.has_attorney, isEmpty: !collectedFields.has_attorney },
  });
  
  // Find first missing required field
  for (const field of requiredFields) {
    // Check if field is missing or has empty string value
    const value = collectedFields[field];
    if (value === undefined || value === null || value === '' || 
        (typeof value === 'string' && value.trim() === '')) {
      
      // Special handling for zip_code - if we have zip_code, auto-populate city and state
      // Note: getCityStateFromZipCode is async, so this is handled elsewhere
      // This function is synchronous, so we can't await here
      
      console.log(`Missing field: ${field}, asking question`);
      return {
        field,
        question: generateQuestionForField(field, collectedFields, category)
      };
    }
  }
  
  console.log('All required fields collected!');
  return null; // All fields collected
}

function getRequiredFieldsForCategory(category: string): string[] {
  // Load the practice areas configuration
  const fs = require('fs');
  const path = require('path');
  
  try {
    const configPath = path.join(process.cwd(), 'chat', 'practice_areas_config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    
    const practiceArea = config.legal_practice_areas[category];
    if (!practiceArea || !practiceArea.required_fields) {
      console.log(`No configuration found for category: ${category}`);
      return getDefaultRequiredFields();
    }
    
    // Extract required fields from the configuration
    const requiredFields: string[] = [];
    
    for (const [fieldName, fieldConfig] of Object.entries(practiceArea.required_fields)) {
      const config = fieldConfig as any;
      if (config && typeof config === 'object' && config.required === true) {
        // Skip server-side fields that are auto-populated
        if (config.source === 'server' || config.source === 'config') {
          continue;
        }
        
        // CRITICAL: Skip fields that should never be asked
        if (fieldName === 'sub_category' || fieldName === 'city' || fieldName === 'state' || fieldName === 'main_category') {
          console.log(`Skipping auto-populated field: ${fieldName}`);
          continue;
        }
        
        requiredFields.push(fieldName);
      }
    }
    
    console.log(`Required fields for ${category}:`, requiredFields);
    return requiredFields;
    
  } catch (error) {
    console.error('Error loading practice areas config:', error);
    return getDefaultRequiredFields();
  }
}

function getDefaultRequiredFields(): string[] {
  // Fallback to basic required fields if config can't be loaded
  return [
    'first_name',
    'last_name',
    'phone',
    'email',
    'zip_code',
    'describe'
  ];
}

function generateQuestionForField(
  field: string,
  collectedFields: Record<string, any>,
  category?: string
): string {
  const firstName = collectedFields.first_name || '';
  const namePrefix = firstName ? `${firstName}, ` : '';
  
  // Special handling for first question when no fields are collected yet
  const isFirstQuestion = Object.keys(collectedFields).length === 0 || 
                         (Object.keys(collectedFields).length === 1 && collectedFields.main_category);
  
  // Try to get the question from the JSON configuration first
  if (category) {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(process.cwd(), 'chat', 'practice_areas_config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      const practiceArea = config.legal_practice_areas[category];
      if (practiceArea && practiceArea.field_questions && practiceArea.field_questions[field]) {
        let question = practiceArea.field_questions[field];
        
        // Handle object-based questions (e.g., date_of_incident with accident/injury/default variants)
        if (typeof question === 'object' && question !== null) {
          // Try to determine the appropriate variant based on collected fields
          const subcategory = collectedFields.sub_category || '';
          const describe = collectedFields.describe || '';
          
          // Check for specific keywords to determine context
          if (subcategory.toLowerCase().includes('accident') || describe.toLowerCase().includes('accident')) {
            question = question.accident || question.default;
          } else if (subcategory.toLowerCase().includes('injury') || describe.toLowerCase().includes('injury')) {
            question = question.injury || question.default;
          } else {
            question = question.default;
          }
          
          // Ensure we have a valid question string
          if (!question || typeof question !== 'string') {
            console.warn(`No valid question found for field ${field} with context:`, { subcategory, describe });
            question = `What is your ${field.replace(/_/g, ' ')}?`;
          }
        }
        
        // Ensure question is a string
        if (typeof question !== 'string') {
          console.warn(`Field question for ${field} is not a string:`, question);
          question = `What is your ${field.replace(/_/g, ' ')}?`;
        }
        
        // Replace placeholders
        question = question.replace(/{name_prefix}/g, namePrefix);
        question = question.replace(/{first_name}/g, firstName);
        
        // Replace compassionate_intro placeholder
        if (question.includes('{compassionate_intro}')) {
          const compassionateIntro = practiceArea.personality?.compassionate_intro || 
            "I'm here to help you with your legal needs.";
          question = question.replace(/{compassionate_intro}/g, compassionateIntro);
        }
        
        return question;
      }
    } catch (error) {
      console.error('Error loading field questions from config:', error);
    }
  }
  
  // Fallback to default questions with better phrasing for first questions
  const questions: Record<string, string> = {
    first_name: isFirstQuestion 
      ? "I'm here to help you find the right attorney for your situation. What's your full name?"
      : "What's your first name?",
    last_name: `${namePrefix}what's your last name?`,
    phone: `${namePrefix}what's the best phone number to reach you at?`,
    email: `${namePrefix}what email address should we use to send you your confirmation and intake ID?`,
    zip_code: `${namePrefix}what's your ZIP code so I can connect you with local attorneys?`,
    city: `${namePrefix}what city are you located in?`,
    state: `${namePrefix}what state?`,
    date_of_incident: `${namePrefix}when did this happen?`,
    bodily_injury: `${namePrefix}were you injured?`,
    at_fault: `${namePrefix}were you at fault?`,
    has_attorney: `${namePrefix}do you currently have an attorney helping you with this?`,
    describe: "Can you describe what happened?",
    category: "What type of legal issue are you facing?",
    subcategory: "Can you be more specific about your situation?",
  };
  
  return questions[field] || `What is your ${field.replace(/_/g, ' ')}?`;
}