import { addTranscriptMessageToSession, clearSessionTranscript } from './supabase-store';
import { ChatSessionData } from '../config/schemas';

/**
 * Adds a message to the conversation transcript for a given session.
 * @param sid The session ID.
 * @param message The message object to add.
 * @returns A promise that resolves to true if the message was added, false otherwise.
 */
export async function addTranscriptMessage(sid: string, message: ChatSessionData['transcript'][0]): Promise<boolean> {
  return addTranscriptMessageToSession(sid, message);
}

/**
 * Clears the entire conversation transcript for a given session.
 * @param sid The session ID.
 * @returns A promise that resolves to true if the transcript was cleared, false otherwise.
 */
export async function clearTranscript(sid: string): Promise<boolean> {
  return clearSessionTranscript(sid);
}