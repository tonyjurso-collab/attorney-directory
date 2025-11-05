import { cookies } from 'next/headers';
import { generateSessionId, getSession, createSession, updateSession, deleteSession } from './session/supabase-store';
import { addTranscriptMessage, clearTranscript } from './session/transcript';
import { ChatSessionData } from './config/schemas';

// Legacy interface for backward compatibility
export interface ChatSession {
  collectedFields?: Record<string, any>;
  category?: string;
  subcategory?: string;
  conversationHistory?: Array<{role: string; content: string}>;
  conversationStep?: 'collecting_fields' | 'ready_to_submit';
}

// Cookie configuration
export const SESSION_COOKIE_NAME = 'legal_intake_session';
export const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/**
 * Get or create a session from cookies
 */
export async function getOrCreateSession(request?: Request): Promise<ChatSessionData | null> {
  try {
    const cookieStore = await cookies();
    const existingSid = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (existingSid) {
      const session = await getSession(existingSid);
      if (session) {
        return session;
      }
    }
    
    // Create new session
    const newSid = generateSessionId();
    
    // Extract request information
    let userAgent = 'Unknown';
    let ipAddress = '127.0.0.1';
    let landingPageUrl: string | undefined;
    
    if (request) {
      userAgent = request.headers.get('user-agent') || 'Unknown';
      
      // Get IP address from various headers
      ipAddress = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  request.headers.get('cf-connecting-ip') || 
                  '127.0.0.1';
      
      // Get landing page URL from referer header
      landingPageUrl = request.headers.get('referer') || undefined;
    }
    
    const newSession = await createSession(ipAddress, userAgent, landingPageUrl, newSid);
    
    // Set cookie
    cookieStore.set(SESSION_COOKIE_NAME, newSid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    
    return newSession;
  } catch (error) {
    console.error('❌ Error getting or creating session:', error);
    return null;
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sid: string): Promise<ChatSessionData | null> {
  return getSession(sid);
}

/**
 * Update session data
 */
export async function updateSessionData(
  sid: string,
  updates: Partial<ChatSessionData>
): Promise<ChatSessionData | null> {
  return updateSession(sid, updates);
}

/**
 * Reset session (clear all data)
 */
export async function resetSession(sid: string): Promise<boolean> {
  try {
    // Clear transcript
    await clearTranscript(sid);
    
    // Delete session
    const deleted = await deleteSession(sid);
    
    if (deleted) {
      console.log(`✅ Reset session: ${sid}`);
    }
    
    return deleted;
  } catch (error) {
    console.error('❌ Error resetting session:', error);
    return false;
  }
}

/**
 * Add message to conversation transcript
 */
export async function addConversationMessage(
  sid: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<boolean> {
  return addTranscriptMessage(sid, {
    role,
    text: content,
    timestamp: new Date().toISOString(),
    metadata,
  });
}

/**
 * Convert ChatSessionData to legacy ChatSession format
 */
export function toLegacySession(sessionData: ChatSessionData): ChatSession {
  return {
    collectedFields: sessionData.answers,
    category: sessionData.main_category || undefined,
    subcategory: sessionData.sub_category || undefined,
    conversationHistory: [], // Will be populated from transcript
    conversationStep: sessionData.stage === 'READY_TO_SUBMIT' ? 'ready_to_submit' : 'collecting_fields',
  };
}

/**
 * Convert legacy ChatSession to ChatSessionData format
 */
export function fromLegacySession(legacySession: ChatSession, sid: string): Partial<ChatSessionData> {
  return {
    sid,
    stage: legacySession.conversationStep === 'ready_to_submit' ? 'READY_TO_SUBMIT' : 'COLLECTING',
    main_category: legacySession.category,
    sub_category: legacySession.subcategory,
    answers: legacySession.collectedFields || {},
    asked: [], // Will be populated from conversation history
  };
}

// Legacy session options for backward compatibility
export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'UFlv4pN7r3LVAwa0zxugRyJkGht1iOsD',
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: SESSION_COOKIE_MAX_AGE,
    sameSite: 'lax' as const,
  },
};
