import OpenAI from 'openai';
import { getCityStateFromZipCode } from '@/lib/utils/zipcode-geocoding';

interface ExtractionResult {
  extractedFields: Record<string, any>;
  category?: string;
  subcategory?: string;
  confidence: number;
  isLegalQuestion?: boolean;
}

export async function extractFieldsFromMessage(
  userMessage: string,
  conversationHistory: Array<{role: string; content: string}>,
  requiredFields: string[],
  currentField?: string
): Promise<ExtractionResult> {
  const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
  
  let systemPrompt = `You are a legal intake specialist. Extract as much information as possible from the user's message.

LEGAL CATEGORIES (detect the correct one):
- personal_injury_law: car accidents, slip and fall, workplace injuries, medical malpractice, product liability
- family_law: divorce, custody, adoption, domestic violence
- criminal_defense: DUI, assault, theft, drug charges, white collar crimes
- business_law: contracts, partnerships, corporate law, employment disputes
- real_estate_law: property disputes, landlord-tenant, real estate transactions
- estate_planning: wills, trusts, probate, elder law
- immigration_law: visas, green cards, citizenship, deportation defense
- employment_law: workplace discrimination, wrongful termination, wage disputes
- bankruptcy_law: Chapter 7, Chapter 13, debt relief
- dui_law: DUI/DWI defense, license suspension, breathalyzer issues

EXTRACTION RULES:
1. Extract ALL available information from the message
2. If information is missing, return null for that field
3. Be conservative - only extract information that is clearly stated
4. For dates, use YYYY-MM-DD format
5. For phone numbers, use (XXX) XXX-XXXX format
6. For addresses, include full address with city, state, zip
7. For case values, extract numeric amounts (remove currency symbols)
8. Detect the legal category and subcategory if possible

REQUIRED FIELDS TO EXTRACT: ${requiredFields.join(', ')}

${currentField ? `CURRENT FIELD FOCUS: ${currentField}` : ''}

Return your response as a JSON object with this structure:
{
  "extractedFields": {
    "field_name": "extracted_value_or_null"
  },
  "category": "detected_category_or_null",
  "subcategory": "detected_subcategory_or_null", 
  "confidence": 0.0-1.0,
  "isLegalQuestion": true/false
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const result = JSON.parse(response);
    
    // Validate and clean the extracted fields
    const cleanedFields: Record<string, any> = {};
    for (const field of requiredFields) {
      const value = result.extractedFields[field];
      if (value !== null && value !== undefined && value !== '') {
        cleanedFields[field] = value;
      } else {
        cleanedFields[field] = null;
      }
    }

    // Enhance location data if zip code is provided
    if (cleanedFields.zip_code && !cleanedFields.city && !cleanedFields.state) {
      try {
        const locationData = await getCityStateFromZipCode(cleanedFields.zip_code);
        if (locationData) {
          cleanedFields.city = locationData.city;
          cleanedFields.state = locationData.state;
        }
      } catch (error) {
        console.error('Error getting location from zip code:', error);
      }
    }

    return {
      extractedFields: cleanedFields,
      category: result.category || null,
      subcategory: result.subcategory || null,
      confidence: result.confidence || 0.5,
      isLegalQuestion: result.isLegalQuestion || false
    };

  } catch (error) {
    console.error('Error in OpenAI extraction:', error);
    
    // Fallback: return empty fields
    const fallbackFields: Record<string, any> = {};
    for (const field of requiredFields) {
      fallbackFields[field] = null;
    }
    
    return {
      extractedFields: fallbackFields,
      category: null,
      subcategory: null,
      confidence: 0.0,
      isLegalQuestion: false
    };
  }
}
