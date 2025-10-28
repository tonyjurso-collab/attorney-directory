import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { detectCategory, detectSubcategory } from '@/lib/chat/services/category-detection.service';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  category: 'personal_injury_law',
                  confidence: 'high'
                })
              }
            }]
          })
        }
      }
    }))
  };
});

// Mock practice areas loader
jest.mock('@/lib/chat/config/practice-areas-loader', () => ({
  getPracticeAreaNames: jest.fn().mockReturnValue([
    'personal_injury_law',
    'family_law',
    'criminal_law',
    'bankruptcy',
    'employment',
    'immigration',
    'medical_malpractice',
    'defective_products',
    'defective_medical_devices',
    'dangerous_drugs',
    'social_security_disability',
    'civil_rights_law',
    'business_law',
    'intellectual_property_law',
    'wills_trusts_estates',
    'tax_law',
    'real_estate',
    'general'
  ]),
  getDetectionKeywords: jest.fn().mockReturnValue(['accident', 'injured', 'hurt'])
}));

describe('Category Detection Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('detectCategory', () => {
    it('should detect personal injury law from accident keywords', async () => {
      const result = await detectCategory('I was in a car accident and got injured');
      
      expect(result.category).toBe('personal_injury_law');
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('regex');
    });

    it('should detect family law from divorce keywords', async () => {
      const result = await detectCategory('I need help with my divorce');
      
      expect(result.category).toBe('family_law');
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('regex');
    });

    it('should detect criminal law from DUI keywords', async () => {
      const result = await detectCategory('I was arrested for DUI');
      
      expect(result.category).toBe('criminal_law');
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('regex');
    });

    it('should fallback to AI detection for unclear cases', async () => {
      const result = await detectCategory('I have a legal problem');
      
      expect(result.category).toBe('personal_injury_law'); // Mocked AI response
      expect(result.method).toBe('ai');
    });

    it('should return general for completely unrelated messages', async () => {
      const result = await detectCategory('What is the weather today?');
      
      expect(result.category).toBe('general');
      expect(result.confidence).toBe('low');
    });

    it('should handle empty or invalid input', async () => {
      const result = await detectCategory('');
      
      expect(result.category).toBe('general');
      expect(result.confidence).toBe('low');
    });
  });

  describe('detectSubcategory', () => {
    it('should detect car accident subcategory', async () => {
      const result = await detectSubcategory('I was in a car accident', 'personal_injury_law');
      
      expect(result.category).toBe('personal_injury_law');
      expect(result.subcategory).toBe('car accident');
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('regex');
    });

    it('should detect truck accident subcategory', async () => {
      const result = await detectSubcategory('I was hit by a truck', 'personal_injury_law');
      
      expect(result.category).toBe('personal_injury_law');
      expect(result.subcategory).toBe('truck accident');
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('regex');
    });

    it('should return other for unknown subcategories', async () => {
      const result = await detectSubcategory('I have some legal issue', 'personal_injury_law');
      
      expect(result.category).toBe('personal_injury_law');
      expect(result.subcategory).toBe('other');
      expect(result.confidence).toBe('low');
    });

    it('should handle invalid category', async () => {
      const result = await detectSubcategory('I was in an accident', 'invalid_category');
      
      expect(result.category).toBe('invalid_category');
      expect(result.subcategory).toBe('other');
      expect(result.confidence).toBe('low');
      expect(result.method).toBe('fallback');
    });
  });

  describe('Performance', () => {
    it('should complete detection within reasonable time', async () => {
      const startTime = Date.now();
      await detectCategory('I was in a car accident');
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should include detection time in result', async () => {
      const result = await detectCategory('I was in a car accident');
      
      expect(result.detectionTimeMs).toBeDefined();
      expect(result.detectionTimeMs).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = require('openai').default;
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const result = await detectCategory('I have a legal problem');
      
      expect(result.category).toBe('general');
      expect(result.confidence).toBe('low');
      expect(result.method).toBe('ai');
    });
  });
});
