import OpenAI from 'openai';
import { getPracticeAreaConfig } from '../config/practice-areas-loader';
import { getCityStateFromZipCode } from '@/lib/google-places/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FieldExtractionResult {
  extractedFields: Record<string, any>;
  confidence: 'high' | 'medium' | 'low';
  reasoning?: string;
}

export interface FieldDefinition {
  name: string;
  type: 'text' | 'email' | 'phone' | 'zip' | 'state' | 'city' | 'date' | 'enum' | 'numeric' | 'ip' | 'url' | 'postal_code';
  required: boolean;
  description?: string;
  allowed_values?: string[];
  format?: string;
}

/**
 * Extract fields from user input using AI intelligence
 */
export async function extractFieldsWithAI(
  message: string,
  currentField: string,
  collectedFields: Record<string, any>,
  practiceArea: string,
  remainingFields: string[]
): Promise<FieldExtractionResult> {
  try {
    // Get practice area configuration
    const config = getPracticeAreaConfig(practiceArea);
    if (!config) {
      throw new Error(`Practice area ${practiceArea} not found`);
    }

    // Build field definitions for remaining fields
    const fieldDefinitions = remainingFields.map(fieldName => {
      const fieldConfig = config.required_fields[fieldName];
      const fieldType = fieldConfig?.type || 'text';
      // Map postal_code to zip for compatibility
      const mappedType = fieldType === 'postal_code' ? 'zip' : fieldType;
      return {
        name: fieldName,
        type: mappedType as FieldDefinition['type'],
        required: fieldConfig?.required || false,
        description: fieldConfig?.description,
        allowed_values: fieldConfig?.allowed_values,
        format: fieldConfig?.format,
      };
    });

    // Create the AI prompt
    const prompt = buildExtractionPrompt(
      message,
      currentField,
      collectedFields,
      practiceArea,
      fieldDefinitions
    );

    console.log('🤖 AI Extraction Prompt:', prompt);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured data from conversational text. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('🤖 AI Response:', content);

    // Clean the response and parse the JSON
    // Remove any comments or extra text that might be in the response
    const cleanedContent = content
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .trim();
    
    const result = JSON.parse(cleanedContent) as FieldExtractionResult;
    
    // Validate the result
    if (!result.extractedFields || typeof result.extractedFields !== 'object') {
      throw new Error('Invalid extraction result format');
    }

    if (!['high', 'medium', 'low'].includes(result.confidence)) {
      result.confidence = 'medium'; // Default confidence
    }

    // Validate extracted fields against their types
    const validatedFields = validateExtractedFields(result.extractedFields, fieldDefinitions);
    
    // Auto-populate city and state from zip code if available
    const enhancedFields = await enhanceFieldsWithZipCode(validatedFields, fieldDefinitions);
    result.extractedFields = enhancedFields;

    console.log('✅ AI extracted fields:', result.extractedFields);
    console.log('🎯 Confidence:', result.confidence);

    return result;

  } catch (error) {
    console.error('❌ AI extraction failed:', error);
    
    // Return fallback result
    return {
      extractedFields: {},
      confidence: 'low',
      reasoning: `AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Build the extraction prompt for OpenAI
 */
function buildExtractionPrompt(
  message: string,
  currentField: string,
  collectedFields: Record<string, any>,
  practiceArea: string,
  fieldDefinitions: FieldDefinition[]
): string {
  const practiceAreaName = practiceArea.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const fieldDescriptions = fieldDefinitions.map(field => {
    let desc = `- ${field.name} (type: ${field.type}, required: ${field.required})`;
    if (field.description) desc += ` - ${field.description}`;
    if (field.allowed_values) desc += ` - allowed values: ${field.allowed_values.join(', ')}`;
    if (field.format) desc += ` - format: ${field.format}`;
    return desc;
  }).join('\n');

  const collectedInfo = Object.keys(collectedFields).length > 0 
    ? `\nAlready collected: ${Object.keys(collectedFields).join(', ')}`
    : '';

  return `You are extracting structured data from a legal intake conversation.

Context:
- Practice Area: ${practiceAreaName}
- Currently asking for: ${currentField}
- User response: "${message}"${collectedInfo}

Available fields to extract:
${fieldDescriptions}

Instructions:
1. Extract the CURRENTLY REQUESTED field (${currentField}) from the user's response
2. If the user provided additional information, extract other fields too
3. Validate each extraction against its type and requirements
4. For names: if user provides "John Smith", extract first_name="John" and last_name="Smith"
5. For dates: Convert relative dates to MM/DD/YYYY format:
   - "yesterday" → yesterday's date
   - "last week" → 7 days ago
   - "2 days ago" → 2 days ago
   - "last month" → 30 days ago
6. For phone: extract digits only (e.g., "555-123-4567" → "5551234567")
7. For email: ensure it contains @ symbol
8. For bodily_injury: ONLY set to "yes" if user explicitly states they were injured/hurt in the accident. Do NOT assume injury from just mentioning "accident" or "pain" without explicit injury context. If unclear, set to "no" or omit the field.
9. For sub_category: detect accident type from context (car accident, truck accident, etc.)
10. Return confidence level based on clarity of extraction

IMPORTANT: Return ONLY valid JSON. No comments, explanations, or extra text.

Return JSON format:
{
  "extractedFields": {
    "field_name": "extracted_value"
  },
  "confidence": "high|medium|low",
  "reasoning": "brief explanation of extraction logic"
}

User message: "${message}"`;
}

/**
 * Validate extracted fields against their type definitions
 */
function validateExtractedFields(
  extractedFields: Record<string, any>,
  fieldDefinitions: FieldDefinition[]
): Record<string, any> {
  const validated: Record<string, any> = {};
  const fieldMap = new Map(fieldDefinitions.map(f => [f.name, f]));

  for (const [fieldName, value] of Object.entries(extractedFields)) {
    const fieldDef = fieldMap.get(fieldName);
    if (!fieldDef) continue;

    const validatedValue = validateFieldValue(value, fieldDef);
    if (validatedValue !== null) {
      validated[fieldName] = validatedValue;
    }
  }

  return validated;
}

/**
 * Enhance fields by auto-populating city and state from zip code
 */
async function enhanceFieldsWithZipCode(
  fields: Record<string, any>,
  fieldDefinitions: FieldDefinition[]
): Promise<Record<string, any>> {
  const enhanced = { ...fields };
  const fieldMap = new Map(fieldDefinitions.map(f => [f.name, f]));

  // Check if we have a zip code and need city/state
  const hasZipCode = enhanced.zip_code && typeof enhanced.zip_code === 'string';
  const needsCity = fieldMap.has('city') && !enhanced.city;
  const needsState = fieldMap.has('state') && !enhanced.state;

  if (hasZipCode && (needsCity || needsState)) {
    try {
      console.log(`🔍 Looking up city/state for zip code: ${enhanced.zip_code}`);
      const locationData = await getCityStateFromZipCode(enhanced.zip_code);
      
      if (locationData) {
        if (needsCity) {
          enhanced.city = locationData.city;
          console.log(`✅ Auto-populated city: ${locationData.city}`);
        }
        if (needsState) {
          enhanced.state = locationData.state;
          console.log(`✅ Auto-populated state: ${locationData.state}`);
        }
      } else {
        console.warn(`⚠️ Could not resolve city/state for zip code: ${enhanced.zip_code}`);
      }
    } catch (error) {
      console.error('Error enhancing fields with zip code data:', error);
    }
  }

  return enhanced;
}

/**
 * Validate a single field value against its type
 */
function validateFieldValue(value: any, fieldDef: FieldDefinition): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const stringValue = String(value).trim();

  switch (fieldDef.type) {
    case 'email':
      if (stringValue.includes('@') && stringValue.includes('.')) {
        return stringValue.toLowerCase();
      }
      break;

    case 'phone':
      // Extract digits only
      const digits = stringValue.replace(/\D/g, '');
      if (digits.length >= 10) {
        return digits;
      }
      break;

    case 'zip':
      // Extract digits only
      const zipDigits = stringValue.replace(/\D/g, '');
      if (zipDigits.length === 5 || zipDigits.length === 9) {
        return zipDigits;
      }
      break;

    case 'state':
      // Convert to uppercase
      if (stringValue.length === 2) {
        return stringValue.toUpperCase();
      }
      break;

    case 'date':
      // Handle relative dates and MM/DD/YYYY format
      if (stringValue.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
        return stringValue;
      }
      // Handle relative dates that AI might have converted
      if (stringValue.match(/yesterday|last week|last month|\d+ days? ago/i)) {
        return stringValue; // Let AI handle the conversion
      }
      break;

    case 'numeric':
      const num = parseFloat(stringValue);
      if (!isNaN(num)) {
        return num;
      }
      break;

    case 'enum':
      if (fieldDef.allowed_values && fieldDef.allowed_values.includes(stringValue)) {
        return stringValue;
      }
      break;

    case 'text':
    case 'city':
    default:
      // Basic text validation
      if (stringValue.length > 0 && stringValue.length <= 255) {
        return stringValue;
      }
      break;
  }

  return null;
}

/**
 * Fallback extraction using simple regex patterns (for when AI fails)
 */
export function extractFieldsWithRegex(
  message: string,
  currentField: string,
  practiceArea: string
): FieldExtractionResult {
  const extractedFields: Record<string, any> = {};

  // Simple name extraction
  if (currentField === 'first_name') {
    const nameMatch = message.match(/^([a-zA-Z\s]+)$/);
    if (nameMatch) {
      const fullName = nameMatch[1].trim();
      const nameParts = fullName.split(/\s+/);
      
      if (nameParts.length === 1) {
        extractedFields.first_name = nameParts[0];
      } else if (nameParts.length >= 2) {
        extractedFields.first_name = nameParts[0];
        extractedFields.last_name = nameParts[nameParts.length - 1];
      }
    }
  }

  // Simple email extraction
  const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    extractedFields.email = emailMatch[1].toLowerCase();
  }

  // Simple phone extraction
  const phoneMatch = message.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    extractedFields.phone = phoneMatch[1].replace(/\D/g, '');
  }

  return {
    extractedFields,
    confidence: Object.keys(extractedFields).length > 0 ? 'medium' : 'low',
    reasoning: 'Regex-based fallback extraction',
  };
}
