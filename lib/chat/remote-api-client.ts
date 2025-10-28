/**
 * Remote PHP API Client
 * Makes calls to the remote LegalHub PHP chat API
 */

import {
  adaptChatResponse,
  adaptSubmitResponse,
  adaptResetResponse,
  PHPChatResponse,
  PHPSubmitResponse,
  PHPResetResponse,
  NextJSChatResponse,
  NextJSSubmitResponse,
  NextJSResetResponse,
} from './api-adapter';
import { getOrCreateSessionId, setSessionId, generateUUID } from './remote-session';
import { logger } from '@/lib/logging/logger';

// Get API base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://freshlocal.co/chat/api';

/**
 * Send a chat message to the remote PHP API
 */
export async function sendChatMessage(
  message: string,
  category?: string,
  subcategory?: string,
  sessionId?: string | null
): Promise<NextJSChatResponse> {
  // IMPORTANT: Never generate session IDs on the server side
  // The client manages session IDs via sessionStorage
  // If no session ID is provided, pass undefined and let the remote API create one
  // The client will then receive and store the new session ID in the response
  
  const sid = sessionId || undefined;

  try {
    logger.debug(`Sending chat message to remote API: ${message.substring(0, 50)}...`, { 
      hasSessionId: !!sid,
      sessionId: sid?.substring(0, 8) + '...' 
    });

    const requestBody: any = {
      q: message,
    };
    
    // Only include optional fields if they have values
    if (category) requestBody.category = category;
    if (subcategory) requestBody.subcategory = subcategory;
    if (sid) requestBody.session_id = sid;
    
    const response = await fetch(`${API_BASE_URL}/ask.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PHPChatResponse = await response.json();

    // Update session ID in sessionStorage if provided (client-side only)
    if (data.session_id && typeof window !== 'undefined') {
      setSessionId(data.session_id);
    }

    // Adapt response to Next.js format
    const adapted = adaptChatResponse(data);

    logger.debug('Chat response adapted', { 
      sessionId: adapted.session_id,
      complete: adapted.complete,
      stage: adapted.debug?.stage,
    });

    return adapted;
  } catch (error) {
    logger.error('Remote chat API error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Submit lead data to the remote PHP API
 */
export async function submitLead(
  sessionId: string,
  leadData: any,
  trackingData?: {
    jornayaLeadId?: string;
    trustedFormCertUrl?: string;
  }
): Promise<NextJSSubmitResponse> {
  if (!sessionId) {
    throw new Error('Session ID is required for lead submission');
  }
  try {
    logger.debug(`Submitting lead to remote API for session: ${sessionId}`, {
      hasLeadData: !!leadData && Object.keys(leadData).length > 0,
      hasTrackingData: !!trackingData
    });

    // The remote PHP API manages lead data via session_id
    // We only need to send session_id and tracking data
    // Try multiple possible field name formats
    const submissionData: any = {
      session_id: sessionId,
    };
    
    // Add tracking data with common field name variations
    if (trackingData?.jornayaLeadId) {
      submissionData.jornaya_leadid = trackingData.jornayaLeadId;
      submissionData.jornayaLeadId = trackingData.jornayaLeadId; // Try both formats
      submissionData.leadid = trackingData.jornayaLeadId; // And this one
    }
    if (trackingData?.trustedFormCertUrl) {
      submissionData.trusted_form_cert_url = trackingData.trustedFormCertUrl;
      submissionData.trustedFormCertUrl = trackingData.trustedFormCertUrl; // Try both formats
      submissionData.trustedForm = trackingData.trustedFormCertUrl; // And this one
    }

    logger.debug('Submission payload:', submissionData);

    const response = await fetch(`${API_BASE_URL}/submit_lead.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      // Try to get the error message from the response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        errorMessage = `${errorMessage} - ${errorText}`;
      } catch (e) {
        // If we can't read the error, just use the status
      }
      logger.error('Submit lead API error:', { status: response.status, message: errorMessage });
      throw new Error(errorMessage);
    }

    const data: PHPSubmitResponse = await response.json();

    // Adapt response to Next.js format
    const adapted = adaptSubmitResponse(data);

    logger.info('Lead submission successful', {
      sessionId,
      leadId: adapted.leadId,
      status: adapted.status,
    });

    return adapted;
  } catch (error) {
    logger.error('Remote lead submission error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Reset session on the remote PHP API
 */
export async function resetSession(sessionId?: string): Promise<NextJSResetResponse> {
  const sid = sessionId || (typeof window !== 'undefined' ? getOrCreateSessionId() : null);
  
  if (!sid) {
    throw new Error('Session ID is required for reset');
  }

  try {
    logger.debug(`Resetting session on remote API: ${sid}`);

    const response = await fetch(`${API_BASE_URL}/reset_session.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sid,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PHPResetResponse = await response.json();

    // Adapt response to Next.js format
    const adapted = adaptResetResponse(data);

    logger.info('Session reset', { sessionId: sid, success: adapted.success });

    return adapted;
  } catch (error) {
    logger.error('Remote session reset error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Health check for the remote API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Try calling a simple endpoint (this is a placeholder - adjust based on your PHP API)
    const response = await fetch(`${API_BASE_URL}/ask.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'test',
        session_id: 'health-check',
      }),
    });

    return response.ok;
  } catch (error) {
    logger.error('Remote API health check failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

