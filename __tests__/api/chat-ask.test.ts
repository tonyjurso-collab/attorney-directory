import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

// Mock session functions
jest.mock('@/lib/chat/session', () => ({
  getOrCreateSession: jest.fn(),
  addConversationMessage: jest.fn()
}));

// Mock services
jest.mock('@/lib/chat/services/category-detection.service', () => ({
  detectCategory: jest.fn(),
  detectSubcategory: jest.fn()
}));

jest.mock('@/lib/chat/services/field-extraction.service', () => ({
  extractFromDescription: jest.fn(),
  extractAndValidate: jest.fn()
}));

jest.mock('@/lib/chat/services/conversation.service', () => ({
  getNextMissingField: jest.fn(),
  getNextStage: jest.fn()
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should handle valid message request', async () => {
      const { getOrCreateSession, addConversationMessage } = require('@/lib/chat/session');
      const { detectCategory, detectSubcategory } = require('@/lib/chat/services/category-detection.service');
      const { extractFromDescription } = require('@/lib/chat/services/field-extraction.service');
      const { getNextMissingField } = require('@/lib/chat/services/conversation.service');

      // Mock session
      getOrCreateSession.mockResolvedValue({
        sid: 'test-session-id',
        stage: 'INIT',
        answers: {},
        ip: '127.0.0.1',
        ua: 'test-user-agent'
      });

      // Mock category detection
      detectCategory.mockResolvedValue({
        category: 'personal_injury_law',
        confidence: 'high',
        method: 'regex'
      });

      detectSubcategory.mockResolvedValue({
        category: 'personal_injury_law',
        subcategory: 'car accident',
        confidence: 'high',
        method: 'regex'
      });

      // Mock field extraction
      extractFromDescription.mockResolvedValue({
        first_name: 'John',
        last_name: 'Smith'
      });

      // Mock conversation flow
      getNextMissingField.mockReturnValue({
        field: 'phone',
        question: 'What is your phone number?',
        stage: 'COLLECTING'
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'I was in a car accident'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('reply');
      expect(data).toHaveProperty('next_field');
      expect(data.next_field).toBe('phone');
      expect(data.complete).toBe(false);
    });

    it('should handle session creation failure', async () => {
      const { getOrCreateSession } = require('@/lib/chat/session');
      
      getOrCreateSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'I was in a car accident'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Failed to create or retrieve session');
    });

    it('should handle invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Message is required');
    });

    it('should handle non-string message', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 123
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Message is required and must be a string');
    });

    it('should handle COLLECTING stage', async () => {
      const { getOrCreateSession, addConversationMessage } = require('@/lib/chat/session');
      const { extractAndValidate } = require('@/lib/chat/services/field-extraction.service');
      const { getNextMissingField } = require('@/lib/chat/services/conversation.service');

      // Mock session in COLLECTING stage
      getOrCreateSession.mockResolvedValue({
        sid: 'test-session-id',
        stage: 'COLLECTING',
        main_category: 'personal_injury_law',
        answers: { first_name: 'John' },
        ip: '127.0.0.1',
        ua: 'test-user-agent'
      });

      // Mock field extraction
      extractAndValidate.mockResolvedValue({
        hasError: false,
        extractedFields: { phone: '(555) 123-4567' },
        validationMethod: 'regex'
      });

      // Mock conversation flow
      getNextMissingField.mockReturnValue({
        field: 'email',
        question: 'What is your email address?',
        stage: 'COLLECTING'
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '(555) 123-4567'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('reply');
      expect(data.next_field).toBe('email');
      expect(data.complete).toBe(false);
    });

    it('should handle field extraction errors', async () => {
      const { getOrCreateSession, addConversationMessage } = require('@/lib/chat/session');
      const { extractAndValidate } = require('@/lib/chat/services/field-extraction.service');

      // Mock session in COLLECTING stage
      getOrCreateSession.mockResolvedValue({
        sid: 'test-session-id',
        stage: 'COLLECTING',
        main_category: 'personal_injury_law',
        answers: { first_name: 'John' },
        ip: '127.0.0.1',
        ua: 'test-user-agent'
      });

      // Mock field extraction error
      extractAndValidate.mockResolvedValue({
        hasError: true,
        errorMessage: 'I couldn\'t understand that phone number',
        validationMethod: 'regex'
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'invalid phone'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('reply');
      expect(data.reply).toContain('couldn\'t understand');
      expect(data.complete).toBe(false);
    });

    it('should handle READY_TO_SUBMIT stage', async () => {
      const { getOrCreateSession, addConversationMessage } = require('@/lib/chat/session');

      // Mock session in READY_TO_SUBMIT stage
      getOrCreateSession.mockResolvedValue({
        sid: 'test-session-id',
        stage: 'READY_TO_SUBMIT',
        main_category: 'personal_injury_law',
        answers: { first_name: 'John', last_name: 'Smith' },
        ip: '127.0.0.1',
        ua: 'test-user-agent'
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'yes'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('reply');
      expect(data.complete).toBe(true);
    });

    it('should handle rate limiting', async () => {
      // This test would require mocking the rate limiting logic
      // For now, we'll test the basic structure
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'test message'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Make multiple requests to test rate limiting
      const responses = await Promise.all([
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request) // This should be rate limited
      ]);

      // At least one response should be rate limited
      const rateLimitedResponse = responses.find(r => r.status === 429);
      expect(rateLimitedResponse).toBeDefined();
    });
  });
});
