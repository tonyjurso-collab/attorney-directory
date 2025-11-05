import OpenAI from 'openai';
import { ChatError } from '@/lib/errors/chat-error';
import { logger } from '@/lib/logging/logger';
import { getAllPracticeAreasSummary } from '@/lib/chat/config/practice-areas-loader';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

interface PracticeAreaDetectionResult {
  main_category: string;
  sub_category: string | null;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

/**
 * Detects practice area using AI with intelligent context understanding.
 * Returns both main category and sub-category when possible.
 */
export async function detectPracticeAreaWithAI(message: string): Promise<PracticeAreaDetectionResult> {
  try {
    const practiceAreas = getAllPracticeAreasSummary();
    
    if (practiceAreas.length === 0) {
      throw new ChatError('No practice areas available for AI detection', 'CONFIG_ERROR', 500);
    }

    const prompt = `You are a legal intake specialist categorizing client inquiries into practice areas.

Available Practice Areas:
${practiceAreas.map((area, index) => 
  `${index + 1}. ${area.name} (KEY: ${area.key}) - Includes: ${area.subcategories.join(', ')}`
).join('\n')}

User Message: "${message}"

Instructions:
- You MUST provide a main_category using the EXACT KEY from the list above (e.g., "personal_injury_law", "social_security_disability", "employment")
- Please also provide a sub_category if the user's message contains enough detail to determine the specific type
- If the message is too vague for a sub-category, set sub_category to null
- Provide a confidence level: "high" (very clear), "medium" (somewhat clear), or "low" (ambiguous)
- Include brief reasoning for your categorization

Return ONLY valid JSON in this exact format:
{
  "main_category": "personal_injury_law",
  "sub_category": "car accident",
  "confidence": "high",
  "reasoning": "User explicitly mentioned being injured in a car accident, which clearly indicates personal injury law with car accident as the specific type"
}`;

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model for detection
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0, // Keep it deterministic for categorization
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    if (!rawResponse) {
      throw new ChatError('Empty response from AI practice area detection', 'AI_DETECTION_ERROR', 500);
    }

    // Clean the response and parse the JSON
    const cleanedContent = rawResponse
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .trim();

    const result = JSON.parse(cleanedContent) as PracticeAreaDetectionResult;

    // Validate the result structure
    if (!result.main_category || !result.confidence) {
      throw new ChatError('Invalid AI detection result structure', 'AI_DETECTION_ERROR', 500);
    }

    // Validate that the main_category is a valid practice area key
    const validKeys = practiceAreas.map(area => area.key);
    if (!validKeys.includes(result.main_category)) {
      logger.warn(`AI returned invalid practice area key: ${result.main_category}. Valid keys: ${validKeys.join(', ')}`);
      throw new ChatError(`Invalid practice area key: ${result.main_category}`, 'AI_DETECTION_ERROR', 500);
    }

    // Validate confidence level
    if (!['high', 'medium', 'low'].includes(result.confidence)) {
      result.confidence = 'medium'; // Default to medium if invalid
    }

    logger.info(`🤖 AI practice area detection result:`, {
      category: result.main_category,
      subCategory: result.sub_category,
      confidence: result.confidence,
      reasoning: result.reasoning
    });

    return result;

  } catch (error) {
    logger.error('Error during AI practice area detection:', error);
    throw new ChatError('AI practice area detection failed', 'AI_DETECTION_ERROR', 500);
  }
}

/**
 * Fallback keyword-based detection for when AI fails or confidence is low.
 * This maintains the existing keyword logic as a reliable backup.
 */
export function detectPracticeAreaWithKeywords(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Personal injury keywords
  if (lowerMessage.includes('accident') || 
      lowerMessage.includes('injured') || 
      lowerMessage.includes('hurt') ||
      lowerMessage.includes('injury') ||
      lowerMessage.includes('car') ||
      lowerMessage.includes('truck') ||
      lowerMessage.includes('motorcycle') ||
      lowerMessage.includes('slip') ||
      lowerMessage.includes('fall') ||
      lowerMessage.includes('workplace') ||
      lowerMessage.includes('medical malpractice')) {
    return 'personal_injury_law';
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
      lowerMessage.includes('fibromyalgia') ||
      lowerMessage.includes('back pain') ||
      lowerMessage.includes('disability claim')) {
    return 'social_security_disability';
  }

  // Family law keywords
  if (lowerMessage.includes('divorce') || 
      lowerMessage.includes('custody') || 
      lowerMessage.includes('child support') ||
      lowerMessage.includes('spousal support') ||
      lowerMessage.includes('alimony') ||
      lowerMessage.includes('separation')) {
    return 'family_law';
  }

  // Criminal defense keywords
  if (lowerMessage.includes('criminal') || 
      lowerMessage.includes('arrest') || 
      lowerMessage.includes('charges') ||
      lowerMessage.includes('court') ||
      lowerMessage.includes('dui') ||
      lowerMessage.includes('assault') ||
      lowerMessage.includes('theft')) {
    return 'criminal_law';
  }

  // Employment law keywords
  if (lowerMessage.includes('employment') || 
      lowerMessage.includes('workplace') || 
      lowerMessage.includes('discrimination') ||
      lowerMessage.includes('harassment') ||
      lowerMessage.includes('wrongful termination') ||
      lowerMessage.includes('fired') ||
      lowerMessage.includes('unemployment') ||
      lowerMessage.includes('wage') ||
      lowerMessage.includes('overtime')) {
    return 'employment';
  }

  return null;
}
