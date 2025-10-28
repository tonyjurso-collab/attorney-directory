// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.LEADPROSPER_API_URL = 'https://test-api.leadprosper.com';
process.env.LEADPROSPER_API_KEY = 'test-leadprosper-key';

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    get: jest.fn(),
    set: jest.fn(),
  })),
  headers: jest.fn(() => Promise.resolve({
    get: jest.fn(),
  })),
}));

// Mock Next.js request
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }
    
    async json() {
      return JSON.parse(this.body as string);
    }
    
    get ip() {
      return '127.0.0.1';
    }
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
    })),
  },
}));

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock AbortSignal
global.AbortSignal = {
  timeout: jest.fn(() => ({
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
} as any;
