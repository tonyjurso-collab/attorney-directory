import { SessionOptions } from 'iron-session';

export interface ChatSession {
  collectedFields?: Record<string, any>;
  category?: string;
  subcategory?: string;
  conversationHistory?: Array<{role: string; content: string}>;
  conversationStep?: 'collecting_fields' | 'ready_to_submit';
}

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || 'UFlv4pN7r3LVAwa0zxugRyJkGht1iOsD',
  cookieName: 'legal_intake_session',
  cookieOptions: {
    secure: false, // Set to false for development
    httpOnly: true,
    maxAge: 3600, // 1 hour
    sameSite: 'lax',
  },
};
