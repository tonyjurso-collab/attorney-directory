import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { ChatSessionData, ChatSessionDataSchema } from '../config/schemas';

const SESSION_TTL_DAYS = 7;

/**
 * Generates a unique session ID.
 * @returns A new UUID.
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Creates a new chat session in Supabase.
 * @param ipAddress The IP address of the user.
 * @param userAgent The user agent string.
 * @param landingPageUrl The landing page URL where the chat was initiated.
 * @param sid Optional session ID. If not provided, a new one will be generated.
 * @returns The newly created session data.
 */
export async function createSession(ipAddress: string, userAgent: string, landingPageUrl?: string, sid?: string): Promise<ChatSessionData> {
  const sessionId = sid || generateSessionId();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const newSession: ChatSessionData = {
    sid: sessionId,
    ipAddress,
    userAgent,
    landingPageUrl,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiresAt,
    main_category: undefined,
    sub_category: undefined,
    stage: 'COLLECTING',
    answers: {},
    asked: [],
    transcript: [],
  };

  const validatedSession = ChatSessionDataSchema.parse(newSession);

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      sid: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      landing_page_url: validatedSession.landingPageUrl,
      main_category: validatedSession.main_category,
      sub_category: validatedSession.sub_category,
      stage: validatedSession.stage,
      answers: validatedSession.answers,
      asked: validatedSession.asked,
      transcript: validatedSession.transcript,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error(`❌ Error creating session ${sessionId}:`, error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  console.log(`✅ Created new session: ${sessionId}`);
  return validatedSession;
}

/**
 * Retrieves a chat session from Supabase.
 * @param sid The session ID.
 * @returns The session data, or null if not found.
 */
export async function getSession(sid: string): Promise<ChatSessionData | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('sid', sid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error(`❌ Error getting session ${sid}:`, error);
      return null;
    }

    // Convert database row to ChatSessionData format
    const sessionData: ChatSessionData = {
      sid: data.sid,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      landingPageUrl: data.landing_page_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at,
      main_category: data.main_category,
      sub_category: data.sub_category,
      stage: data.stage as ChatSessionData['stage'],
      answers: data.answers || {},
      asked: data.asked || [],
      transcript: data.transcript || [],
      leadId: data.lead_id,
      leadStatus: data.lead_status,
    };

    // Validate with Zod schema
    return ChatSessionDataSchema.parse(sessionData);
  } catch (error) {
    console.error(`❌ Error getting session ${sid}:`, error);
    return null;
  }
}

/**
 * Updates an existing chat session in Supabase.
 * @param sid The session ID.
 * @param updates Partial session data to update.
 * @returns The updated session data, or null if the session does not exist.
 */
export async function updateSession(sid: string, updates: Partial<ChatSessionData>): Promise<ChatSessionData | null> {
  const existingSession = await getSession(sid);
  if (!existingSession) {
    return null;
  }

  const updatedSession = {
    ...existingSession,
    ...updates,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(), // Extend TTL on update
  };

  const validatedSession = ChatSessionDataSchema.parse(updatedSession);

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({
      main_category: validatedSession.main_category,
      sub_category: validatedSession.sub_category,
      stage: validatedSession.stage,
      answers: validatedSession.answers,
      asked: validatedSession.asked,
      transcript: validatedSession.transcript,
      lead_id: validatedSession.leadId,
      lead_status: validatedSession.leadStatus,
      landing_page_url: validatedSession.landingPageUrl,
      updated_at: validatedSession.updatedAt,
      expires_at: validatedSession.expiresAt,
    })
    .eq('sid', sid)
    .select()
    .single();

  if (error) {
    console.error(`❌ Error updating session ${sid}:`, error);
    return null;
  }

  return validatedSession;
}

/**
 * Deletes a chat session from Supabase.
 * @param sid The session ID.
 * @returns True if the session was deleted, false otherwise.
 */
export async function deleteSession(sid: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('sid', sid);

    if (error) {
      console.error(`❌ Error deleting session ${sid}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Error deleting session ${sid}:`, error);
    return false;
  }
}

/**
 * Adds a message to the session's transcript.
 * @param sid The session ID.
 * @param message The message object to add.
 * @returns True if the message was added, false otherwise.
 */
export async function addTranscriptMessageToSession(sid: string, message: ChatSessionData['transcript'][0]): Promise<boolean> {
  const session = await getSession(sid);
  if (!session) {
    return false;
  }

  const updatedTranscript = [...session.transcript, { ...message, timestamp: new Date().toISOString() }];
  return (await updateSession(sid, { transcript: updatedTranscript })) !== null;
}

/**
 * Clears the transcript for a given session.
 * @param sid The session ID.
 * @returns True if the transcript was cleared, false otherwise.
 */
export async function clearSessionTranscript(sid: string): Promise<boolean> {
  const session = await getSession(sid);
  if (!session) {
    return false;
  }
  return (await updateSession(sid, { transcript: [] })) !== null;
}

/**
 * Cleans up expired sessions from the database.
 * @returns The number of sessions deleted.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .rpc('cleanup_expired_sessions');

    if (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
      return 0;
    }

    console.log(`✅ Cleaned up ${data} expired sessions`);
    return data;
  } catch (error) {
    console.error('❌ Error cleaning up expired sessions:', error);
    return 0;
  }
}
