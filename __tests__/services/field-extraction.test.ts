import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { extractFromDescription, extractAndValidate } from '@/lib/chat/services/field-extraction.service';

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
                  first_name: 'John',
                  last_name: 'Smith',
                  email: 'john@example.com',
                  phone: '(555) 123-4567'
                })
              }
            }]
          })
        }
      }
    }))
  };
});

// Mock schemas
jest.mock('@/lib/chat/config/schemas', () => ({
  validateField: jest.fn().mockImplementation((field, value, category) => ({
    valid: true,
    value: value
  })),
  getFieldTypeInfo: jest.fn().mockReturnValue({
    type: 'text',
    required: true
  })
}));

// Mock practice areas loader
jest.mock('@/lib/chat/config/practice-areas-loader', () => ({
  getRequiredFields: jest.fn().mockReturnValue({
    first_name: { type: 'text', required: true },
    last_name: { type: 'text', required: true },
    email: { type: 'email', required: true },
    phone: { type: 'phone', required: true },
    zip_code: { type: 'zip', required: true }
  })
}));

// Mock fetch for ZIP code lookup
global.fetch = jest.fn();

describe('Field Extraction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful ZIP code lookup
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        places: [{
          'place name': 'San Francisco',
          'state abbreviation': 'CA'
        }]
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('extractFromDescription', () => {
    it('should extract fields from initial description', async () => {
      const description = 'Hi, I\'m John Smith. I was in a car accident yesterday. My email is john@example.com and phone is (555) 123-4567.';
      
      const result = await extractFromDescription(description, 'personal_injury_law');
      
      expect(result).toHaveProperty('first_name');
      expect(result).toHaveProperty('last_name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('phone');
    });

    it('should handle empty description', async () => {
      const result = await extractFromDescription('', 'personal_injury_law');
      
      expect(result).toEqual({});
    });

    it('should handle description with no extractable fields', async () => {
      const result = await extractFromDescription('Hello there', 'personal_injury_law');
      
      expect(result).toEqual({});
    });
  });

  describe('extractAndValidate', () => {
    it('should extract and validate phone number', async () => {
      const result = await extractAndValidate(
        '(555) 123-4567',
        'phone',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.phone).toBe('(555) 123-4567');
      expect(result.validationMethod).toBe('regex');
    });

    it('should extract and validate email', async () => {
      const result = await extractAndValidate(
        'john@example.com',
        'email',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.email).toBe('john@example.com');
      expect(result.validationMethod).toBe('regex');
    });

    it('should extract and validate ZIP code with city/state lookup', async () => {
      const result = await extractAndValidate(
        '94102',
        'zip_code',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.zip_code).toBe('94102');
      expect(result.extractedFields.city).toBe('San Francisco');
      expect(result.extractedFields.state).toBe('CA');
    });

    it('should handle invalid phone number', async () => {
      const result = await extractAndValidate(
        'invalid phone',
        'phone',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(true);
      expect(result.errorMessage).toContain('phone number');
    });

    it('should handle invalid email', async () => {
      const result = await extractAndValidate(
        'invalid email',
        'email',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(true);
      expect(result.errorMessage).toContain('email');
    });

    it('should handle name extraction', async () => {
      const result = await extractAndValidate(
        'John Smith',
        'first_name',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.first_name).toBe('John');
      expect(result.extractedFields.last_name).toBe('Smith');
      expect(result.validationMethod).toBe('full_name_parsed');
    });

    it('should handle incomplete name', async () => {
      const result = await extractAndValidate(
        'John',
        'first_name',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.first_name).toBe('John');
      expect(result.followUpQuestion).toContain('last name');
      expect(result.validationMethod).toBe('partial_name_parsed');
    });

    it('should handle last name completion', async () => {
      const result = await extractAndValidate(
        'Smith',
        'last_name',
        { first_name: 'John' },
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.last_name).toBe('Smith');
      expect(result.validationMethod).toBe('last_name_completed');
    });

    it('should handle yes/no questions', async () => {
      const result = await extractAndValidate(
        'yes',
        'bodily_injury',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.bodily_injury).toBe('yes');
      expect(result.validationMethod).toBe('regex');
    });

    it('should handle date extraction', async () => {
      const result = await extractAndValidate(
        '2023-12-01',
        'date_of_incident',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.date_of_incident).toBe('2023-12-01');
      expect(result.validationMethod).toBe('regex');
    });

    it('should handle relative dates', async () => {
      const result = await extractAndValidate(
        'yesterday',
        'date_of_incident',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.date_of_incident).toBeDefined();
      expect(result.validationMethod).toBe('regex');
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = require('openai').default;
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const result = await extractAndValidate(
        'some text',
        'phone',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(true);
      expect(result.validationMethod).toBe('ai_failed');
    });

    it('should handle ZIP code lookup failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false
      });

      const result = await extractAndValidate(
        '94102',
        'zip_code',
        {},
        'personal_injury_law'
      );
      
      expect(result.hasError).toBe(false);
      expect(result.extractedFields.zip_code).toBe('94102');
      // City/state should not be populated due to lookup failure
      expect(result.extractedFields.city).toBeUndefined();
      expect(result.extractedFields.state).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should complete extraction within reasonable time', async () => {
      const startTime = Date.now();
      await extractAndValidate('(555) 123-4567', 'phone', {}, 'personal_injury_law');
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should include extraction time in result', async () => {
      const result = await extractAndValidate('(555) 123-4567', 'phone', {}, 'personal_injury_law');
      
      expect(result.extractionTimeMs).toBeDefined();
      expect(result.extractionTimeMs).toBeGreaterThan(0);
    });
  });
});
