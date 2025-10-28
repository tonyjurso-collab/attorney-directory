import { ChatSessionData } from '../config/schemas';
import { loadPracticeAreasConfig, getPracticeAreaBySlug } from '../config/practice-areas-loader';
import { logger } from '@/lib/logging/logger';
import { detectPracticeAreaWithAI, detectPracticeAreaWithKeywords } from '../utils/ai-practice-area-detector';

export interface CategoryDetectionResult {
  mainCategory?: string;
  subCategory?: string;
  confidence: number;
}

export class CategoryDetectionService {
  private config = loadPracticeAreasConfig();

  /**
   * Detect the main category from user message using AI with keyword fallback
   */
  async detectCategory(message: string, session: ChatSessionData): Promise<CategoryDetectionResult> {
    try {
      logger.debug(`Category detection for message: "${message}"`);

      // Try AI detection first
      try {
        const aiResult = await detectPracticeAreaWithAI(message);
        
        // Only use AI result if confidence is high or medium
        if (aiResult.confidence === 'high' || aiResult.confidence === 'medium') {
          logger.info(`🤖 AI detected category: ${aiResult.main_category} (confidence: ${aiResult.confidence})`);
          
          return {
            mainCategory: aiResult.main_category,
            subCategory: aiResult.sub_category || undefined,
            confidence: aiResult.confidence === 'high' ? 0.9 : 0.6,
          };
        }
      } catch (error) {
        logger.warn(`AI detection failed: ${error instanceof Error ? error.message : 'Unknown error'}, falling back to keywords`);
      }

      // Fallback to keyword-based detection
      const keywordResult = detectPracticeAreaWithKeywords(message);
      if (keywordResult) {
        logger.info(`🔑 Keyword detected category: ${keywordResult}`);
        return {
          mainCategory: keywordResult,
          confidence: 0.5,
        };
      }

      logger.debug('No specific category detected');
      return { confidence: 0 };
    } catch (error) {
      logger.error(`Category detection error: ${error instanceof Error ? error.message : String(error)}`);
      return { confidence: 0 };
    }
  }

  /**
   * Detect subcategory from user message
   */
  async detectSubcategory(message: string, mainCategory: string, session: ChatSessionData): Promise<CategoryDetectionResult> {
    const practiceArea = getPracticeAreaBySlug(mainCategory);
    if (!practiceArea?.subcategories) {
      return { confidence: 0 };
    }

    const lowerMessage = message.toLowerCase();
    let bestMatch: { subcategory: string; score: number } | null = null;

    for (const subcategory of practiceArea.subcategories) {
      let score = 0;
      
      // Check if message contains subcategory name
      if (lowerMessage.includes(subcategory.toLowerCase())) {
        score += 3;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { subcategory: subcategory, score };
      }
    }

    if (bestMatch && bestMatch.score >= 2) {
      logger.info(`Subcategory detected: ${bestMatch.subcategory} (confidence: ${bestMatch.score})`);
      return {
        mainCategory,
        subCategory: bestMatch.subcategory,
        confidence: bestMatch.score / 5,
      };
    }

    // Default to 'other' if no subcategory is detected
    logger.info(`No specific subcategory detected for ${mainCategory}, defaulting to 'other'`);
    return { 
      mainCategory, 
      subCategory: 'other',
      confidence: 0 
    };
  }
}