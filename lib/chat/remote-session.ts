/**
 * Remote Session Management
 * Handles session ID generation and storage using sessionStorage
 */

const STORAGE_KEY = 'legalhub_session_id';

/**
 * Generate a UUID v4 for session IDs
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get existing session ID from sessionStorage or create a new one
 * Sessions persist within a browser tab and clear when tab is closed
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a temporary ID
    return generateUUID();
  }

  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Set/update session ID in sessionStorage
 */
export function setSessionId(sessionId: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }
}

/**
 * Clear session ID from sessionStorage
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if a session ID exists
 */
export function hasSessionId(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

