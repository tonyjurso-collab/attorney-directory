import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';

// Redis client configuration
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

// Session data interface
export interface ChatSessionData {
  sid: string;
  stage: 'INIT' | 'CATEGORIZED' | 'COLLECTING' | 'READY_TO_SUBMIT' | 'SUBMITTED';
  main_category?: string;
  sub_category?: string;
  answers: Record<string, any>;
  asked: string[];
  created_at: string;
  updated_at: string;
  ip: string;
  ua: string;
  lead_status?: 'queued' | 'sent' | 'failed';
  vendor_response?: any;
}

// Session key patterns
const SESSION_KEY_PREFIX = 'sess:';
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Get session key for Redis
 */
function getSessionKey(sid: string): string {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

/**
 * Create a new session
 */
export async function createSession(
  ip: string,
  ua: string,
  sid?: string
): Promise<ChatSessionData> {
  const sessionId = sid || generateSessionId();
  const now = new Date().toISOString();
  
  const sessionData: ChatSessionData = {
    sid: sessionId,
    stage: 'INIT',
    answers: {},
    asked: [],
    created_at: now,
    updated_at: now,
    ip,
    ua,
  };

  const sessionKey = getSessionKey(sessionId);
  
  try {
    await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(sessionData));
    console.log(`✅ Created new session: ${sessionId}`);
    return sessionData;
  } catch (error) {
    console.error('❌ Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Get session by ID
 */
export async function getSession(sid: string): Promise<ChatSessionData | null> {
  const sessionKey = getSessionKey(sid);
  
  try {
    const sessionData = await redis.get(sessionKey);
    
    if (!sessionData) {
      return null;
    }
    
    return JSON.parse(sessionData as string) as ChatSessionData;
  } catch (error) {
    console.error('❌ Error getting session:', error);
    return null;
  }
}

/**
 * Update session data
 */
export async function updateSession(
  sid: string,
  updates: Partial<ChatSessionData>
): Promise<ChatSessionData | null> {
  const sessionKey = getSessionKey(sid);
  
  try {
    // Get existing session
    const existingSession = await getSession(sid);
    if (!existingSession) {
      return null;
    }
    
    // Merge updates
    const updatedSession: ChatSessionData = {
      ...existingSession,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    // Save back to Redis with TTL refresh
    await redis.setex(sessionKey, SESSION_TTL, JSON.stringify(updatedSession));
    
    console.log(`✅ Updated session: ${sid}`);
    return updatedSession;
  } catch (error) {
    console.error('❌ Error updating session:', error);
    return null;
  }
}

/**
 * Update session answers (merge with existing)
 */
export async function updateSessionAnswers(
  sid: string,
  newAnswers: Record<string, any>
): Promise<ChatSessionData | null> {
  const existingSession = await getSession(sid);
  if (!existingSession) {
    return null;
  }
  
  const mergedAnswers = {
    ...existingSession.answers,
    ...newAnswers,
  };
  
  return updateSession(sid, { answers: mergedAnswers });
}

/**
 * Add field to asked list
 */
export async function addAskedField(
  sid: string,
  field: string
): Promise<ChatSessionData | null> {
  const existingSession = await getSession(sid);
  if (!existingSession) {
    return null;
  }
  
  const updatedAsked = [...existingSession.asked];
  if (!updatedAsked.includes(field)) {
    updatedAsked.push(field);
  }
  
  return updateSession(sid, { asked: updatedAsked });
}

/**
 * Update session stage
 */
export async function updateSessionStage(
  sid: string,
  stage: ChatSessionData['stage']
): Promise<ChatSessionData | null> {
  return updateSession(sid, { stage });
}

/**
 * Delete session
 */
export async function deleteSession(sid: string): Promise<boolean> {
  const sessionKey = getSessionKey(sid);
  
  try {
    const result = await redis.del(sessionKey);
    console.log(`✅ Deleted session: ${sid}`);
    return result > 0;
  } catch (error) {
    console.error('❌ Error deleting session:', error);
    return false;
  }
}

/**
 * Extend session TTL
 */
export async function extendSessionTTL(sid: string): Promise<boolean> {
  const sessionKey = getSessionKey(sid);
  
  try {
    const result = await redis.expire(sessionKey, SESSION_TTL);
    return result === 1;
  } catch (error) {
    console.error('❌ Error extending session TTL:', error);
    return false;
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  sessionsByStage: Record<string, number>;
  oldestSession?: string;
  newestSession?: string;
}> {
  try {
    const keys = await redis.keys(`${SESSION_KEY_PREFIX}*`);
    const sessions: ChatSessionData[] = [];
    
    for (const key of keys) {
      const sessionData = await redis.get(key);
      if (sessionData) {
        sessions.push(JSON.parse(sessionData as string));
      }
    }
    
    const sessionsByStage: Record<string, number> = {};
    let oldestSession: string | undefined;
    let newestSession: string | undefined;
    
    for (const session of sessions) {
      sessionsByStage[session.stage] = (sessionsByStage[session.stage] || 0) + 1;
      
      if (!oldestSession || session.created_at < oldestSession) {
        oldestSession = session.created_at;
      }
      
      if (!newestSession || session.created_at > newestSession) {
        newestSession = session.created_at;
      }
    }
    
    return {
      totalSessions: sessions.length,
      sessionsByStage,
      oldestSession,
      newestSession,
    };
  } catch (error) {
    console.error('❌ Error getting session stats:', error);
    return {
      totalSessions: 0,
      sessionsByStage: {},
    };
  }
}

/**
 * Clean up expired sessions (manual cleanup if needed)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const keys = await redis.keys(`${SESSION_KEY_PREFIX}*`);
    let cleanedCount = 0;
    
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no expiration, set one
        await redis.expire(key, SESSION_TTL);
        cleanedCount++;
      } else if (ttl === -2) {
        // Key doesn't exist, remove from our list
        cleanedCount++;
      }
    }
    
    console.log(`✅ Cleaned up ${cleanedCount} expired sessions`);
    return cleanedCount;
  } catch (error) {
    console.error('❌ Error cleaning up sessions:', error);
    return 0;
  }
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}
