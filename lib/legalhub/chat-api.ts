/**
 * LegalHub Chat API Client
 * Handles all communication with the external LegalHub chatbot service
 * Location: lib/legalhub/chat-api.ts
 */

const LEGALHUB_API_BASE = 'https://legalhub.com/chat/api';

export interface ChatResponse {
  answer: string;
  debug?: any;
  submit_lead?: boolean;
  lead_data?: any;
}

export interface LeadSubmissionResponse {
  success: boolean;
  status: string;
  message: string;
  lead_id?: string;
  practice_area?: string;
}

/**
 * Send a chat message to LegalHub AI assistant
 */
export async function sendChatMessage(
  message: string,
  category?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${LEGALHUB_API_BASE}/ask.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for PHP session cookies
      body: JSON.stringify({
        q: message,
        category: category,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Unable to connect to chat service. Please try again.');
  }
}

/**
 * Submit lead data to LeadProsper via LegalHub
 */
export async function submitLead(
  leadData: any
): Promise<LeadSubmissionResponse> {
  try {
    const response = await fetch(`${LEGALHUB_API_BASE}/submit_lead.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lead submission error:', error);
    throw new Error('Unable to submit lead. Please try again.');
  }
}

/**
 * Reset the conversation and start fresh
 * This clears the PHP session on the server (equivalent to session_destroy(); session_start();)
 */
export async function resetConversation(): Promise<void> {
  try {
    console.log('🔄 Resetting conversation...');
    const response = await fetch(`${LEGALHUB_API_BASE}/reset_session.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for sending session cookie
    });
    
    if (!response.ok) {
      console.error('❌ Reset session failed:', response.status, response.statusText);
    } else {
      console.log('✅ Session reset successfully');
    }
  } catch (error) {
    console.error('❌ Reset conversation error:', error);
    // Don't throw - this is not critical for user experience
  }
}

/**
 * Check if the LegalHub API is accessible
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${LEGALHUB_API_BASE}/ask.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ q: 'test' }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

