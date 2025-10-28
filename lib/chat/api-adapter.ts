/**
 * API Response Adapters
 * Transforms between PHP API response format and Next.js format
 */

/**
 * PHP API Chat Response Format
 */
export interface PHPChatResponse {
  answer: string;
  session_id: string;
  debug?: {
    step: string;
    category: string;
    subcategory?: string;
    fields_collected?: number;
    field_names?: string[];
    missing_fields?: string[];
    next_required?: string[];
    collectedFields?: Record<string, any>;
    ready_for_submission?: boolean;
  };
  complete?: boolean;
  field_asked?: string;
}

/**
 * Next.js Chat Response Format
 */
export interface NextJSChatResponse {
  reply: string;
  session_id: string;
  complete: boolean;
  field_asked?: string | null;
  prefill?: Record<string, string>;
  debug?: {
    collectedFields: Record<string, any>;
    mainCategory: string;
    subCategory: string;
    stage: string;
    transcriptLength: number;
  };
}

/**
 * PHP Lead Submission Response
 */
export interface PHPSubmitResponse {
  success: boolean;
  status: string;
  message?: string;
  lead_id?: string;
  practice_area?: string;
}

/**
 * Next.js Lead Submission Response
 */
export interface NextJSSubmitResponse {
  status: string;
  leadId?: string;
  message?: string;
}

/**
 * PHP Reset Response
 */
export interface PHPResetResponse {
  status: string;
  session_id?: string;
}

/**
 * Next.js Reset Response
 */
export interface NextJSResetResponse {
  success: boolean;
  message: string;
  session_id?: string;
}

/**
 * Adapt PHP chat response to Next.js format
 */
export function adaptChatResponse(phpResponse: PHPChatResponse): NextJSChatResponse {
  // Map debug.step to stage
  const stageMap: Record<string, string> = {
    'data_collection': 'COLLECTING',
    'ready_to_submit': 'READY_TO_SUBMIT',
    'submitted': 'SUBMITTED',
    'welcome': 'INITIAL',
  };

  const stage = phpResponse.debug?.step 
    ? (stageMap[phpResponse.debug.step] || phpResponse.debug.step.toUpperCase())
    : 'COLLECTING';

  // Infer complete status from ready_for_submission or step
  const isComplete = phpResponse.complete || 
                     phpResponse.debug?.step === 'ready_to_submit' ||
                     phpResponse.debug?.ready_for_submission === true;

  // Extract collected fields from debug info
  const collectedFields = phpResponse.debug?.collectedFields || {};
  
  // Get next field to ask from missing_fields or next_required
  const nextRequired = phpResponse.debug?.next_required || phpResponse.debug?.missing_fields || [];
  const fieldAsked = nextRequired.length > 0 ? nextRequired[0] : null;

  return {
    reply: phpResponse.answer,
    session_id: phpResponse.session_id,
    complete: isComplete,
    field_asked: fieldAsked,
    debug: {
      collectedFields,
      mainCategory: phpResponse.debug?.category || '',
      subCategory: phpResponse.debug?.subcategory || 'other',
      stage,
      transcriptLength: phpResponse.debug?.fields_collected || 0,
    },
  };
}

/**
 * Adapt PHP submit response to Next.js format
 */
export function adaptSubmitResponse(phpResponse: PHPSubmitResponse): NextJSSubmitResponse {
  return {
    status: phpResponse.success ? 'submitted' : 'failed',
    leadId: phpResponse.lead_id,
    message: phpResponse.message || 'Lead submitted successfully',
  };
}

/**
 * Adapt PHP reset response to Next.js format
 */
export function adaptResetResponse(phpResponse: PHPResetResponse): NextJSResetResponse {
  return {
    success: phpResponse.status === 'session_cleared',
    message: phpResponse.status === 'session_cleared' 
      ? 'Session reset successfully'
      : 'Failed to reset session',
    session_id: phpResponse.session_id,
  };
}

