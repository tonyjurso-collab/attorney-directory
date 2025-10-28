import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, updateSessionData, addConversationMessage, getSessionById } from '@/lib/chat/session';
import { logger } from '@/lib/logging/logger';
import { ChatError } from '@/lib/errors/chat-error';
import { 
  detectPracticeArea, 
  getNextFieldInFlow, 
  getFormattedQuestion, 
  isAllRequiredFieldsCollected,
  extractFieldValue,
  getRequiredFieldsList,
  getMissingRequiredFields,
  getRemainingFields
} from '@/lib/chat/utils/field-helpers';
import { extractFieldsWithAI, extractFieldsWithRegex } from '@/lib/chat/utils/ai-field-extractor';

// Rate limiting (simple in-memory store for now)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds

/**
 * POST /api/chat - Main chat endpoint (Working Version)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let session: any = null;

  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, meta, session_id } = body;

    if (!message || typeof message !== 'string') {
      throw new ChatError('Message is required and must be a string', 'INVALID_REQUEST', 400);
    }

    // Get or create session (use provided session_id if available)
    if (session_id) {
      session = await getSessionById(session_id);
      if (!session) {
        // If session doesn't exist, create a new one
        session = await getOrCreateSession();
      }
    } else {
      session = await getOrCreateSession();
    }
    if (!session) {
      throw new ChatError('Failed to create or retrieve session', 'SESSION_ERROR', 500);
    }

    logger.info(`💬 Processing message for session ${session.sid}:`, {
      stage: session.stage,
      category: session.main_category,
      messageLength: message.length,
    });

    // Log user message
    await addConversationMessage(session.sid, 'user', message, {
      stage: session.stage,
      ip: session.ipAddress,
      userAgent: session.userAgent,
    });

    // Simple response logic for now
    let reply = '';
    let nextField: string | null = null;
    let prefill: Record<string, string> = {};
    let complete = false;

    // Initialize answers if not exists
    if (!session.answers) {
      session.answers = {};
    }

    // Detect practice area if not already set
    if (!session.main_category) {
      const detection = await detectPracticeArea(message);
      if (detection.category) {
        session.main_category = detection.category;
        if (detection.subCategory) {
          session.sub_category = detection.subCategory;
        }
        logger.info(`🎯 Detected practice area: ${detection.category}`, {
          subCategory: detection.subCategory,
          confidence: detection.confidence
        });
      }
    }

    // If we have a practice area, use configuration-based flow with AI extraction
    if (session.main_category) {
      // Get current field and remaining fields
      const currentField = getNextFieldInFlow(session.main_category, session.answers);
      const remainingFields = getRemainingFields(session.main_category, session.answers);
      
      // Check if this is an initial rich message (contains multiple pieces of info)
      const isInitialRichMessage = Object.keys(session.answers).length === 0 && 
        (message.toLowerCase().includes('my name is') || 
         message.toLowerCase().includes('i was') ||
         message.toLowerCase().includes('i am') ||
         message.toLowerCase().includes('hi') ||
         message.toLowerCase().includes('hello'));
      
      if (currentField || isInitialRichMessage) {
        // Use AI to extract fields intelligently
        let extractionResult;
        
        try {
          // For initial rich messages, extract from ALL remaining fields, not just current field
          const fieldsToExtract = isInitialRichMessage ? remainingFields : [currentField, ...remainingFields];
          
          extractionResult = await extractFieldsWithAI(
            message,
            currentField || 'describe', // Use describe as fallback for initial messages
            session.answers,
            session.main_category,
            fieldsToExtract
          );
          
          logger.info(`🤖 AI extraction result:`, {
            confidence: extractionResult.confidence,
            extractedCount: Object.keys(extractionResult.extractedFields).length,
            fields: Object.keys(extractionResult.extractedFields),
            isInitialRichMessage,
          });
        } catch (error) {
          logger.warn(`⚠️ AI extraction failed, using regex fallback:`, error);
          extractionResult = extractFieldsWithRegex(message, currentField || 'describe', session.main_category);
        }
        
        // Update session with ALL extracted fields (filter out null/empty values)
        if (extractionResult.extractedFields && Object.keys(extractionResult.extractedFields).length > 0) {
          // Filter out null, undefined, and empty string values
          const validFields = Object.fromEntries(
            Object.entries(extractionResult.extractedFields).filter(([_, value]) => 
              value !== null && value !== undefined && value !== ''
            )
          );
          
          if (Object.keys(validFields).length > 0) {
            Object.assign(session.answers, validFields);
            
            logger.info(`📝 AI extracted ${Object.keys(validFields).length} field(s):`, validFields);
            
            // Check if we have more fields to collect
            const nextFieldToCollect = getNextFieldInFlow(session.main_category, session.answers);
            
            if (nextFieldToCollect) {
              // More fields needed
              reply = getFormattedQuestion(session.main_category, nextFieldToCollect, session.answers);
              nextField = nextFieldToCollect;
            } else {
              // All required fields collected
              complete = true;
              reply = `Excellent! I have all the information I need to connect you with qualified ${session.main_category.replace(/_/g, ' ')} attorneys in your area. Would you like me to submit your information?`;
            }
          } else {
            // No valid fields extracted, ask for clarification
            reply = getFormattedQuestion(session.main_category, currentField, session.answers);
            nextField = currentField;
          }
        } else {
          // No fields extracted, ask for clarification
          reply = getFormattedQuestion(session.main_category, currentField, session.answers);
          nextField = currentField;
        }
      } else {
        // All fields collected, but user sent another message
        complete = true;
        reply = `I have all the information I need. Would you like me to submit your information to connect you with qualified attorneys?`;
      }
    } else {
      // No practice area detected yet, ask for clarification
      reply = "I'm here to help you find the right attorney for your legal needs. What legal issue can I help you with today?";
    }

    // Update session with collected data
    await updateSessionData(session.sid, { 
      main_category: session.main_category,
      answers: session.answers,
      stage: complete ? 'READY_TO_SUBMIT' : 'COLLECTING'
    });

    // Log AI response
    await addConversationMessage(session.sid, 'assistant', reply, {
      stage: session.stage,
      nextField,
      complete,
    });

    const endTime = Date.now();
    logger.info(`✅ Chat API response for session ${session.sid} in ${endTime - startTime}ms. Stage: ${session.stage}`);

    return NextResponse.json({
      reply,
      next_field: nextField,
      prefill,
      complete,
      session_id: session.sid,
      collected_answers: session.answers || {},
      current_field: nextField,
      debug: {
        collectedFields: session.answers || {},
        mainCategory: session.main_category,
        subCategory: session.sub_category,
        stage: session.stage,
        transcriptLength: session.transcript?.length || 0,
        processingTime: endTime - startTime,
        requiredFields: session.main_category ? getRequiredFieldsList(session.main_category) : [],
        missingFields: session.main_category ? getMissingRequiredFields(session.main_category, session.answers || {}) : [],
      },
    });

  } catch (error) {
    const err = error instanceof ChatError ? error : new ChatError('An unexpected error occurred.', 'UNKNOWN_ERROR', 500, error);
    logger.error(`❌ Chat API error for session ${session?.sid || 'N/A'}: ${err.message}`, { error: err });

    // Log AI error response
    if (session) {
      await addConversationMessage(session.sid, 'assistant', err.displayMessage, {
        stage: session.stage,
        error: err.code,
      });
    }

    return NextResponse.json(
      {
        reply: err.displayMessage,
        complete: false,
        error: err.message,
        errorCode: err.code,
      },
      { status: err.statusCode }
    );
  }
}

/**
 * Simple rate limiting function
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const client = rateLimitMap.get(ip);

  if (client && now < client.resetTime) {
    if (client.count >= RATE_LIMIT_MAX) {
      return false;
    }
    client.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }
  return true;
}

/**
 * Convert technical field names to user-friendly display names
 */
function getFieldDisplayName(fieldName: string): string {
  const fieldDisplayMap: Record<string, string> = {
    'describe': 'your case details',
    'main_category': 'the type of legal help you need',
    'sub_category': 'the specific type of accident',
    'bodily_injury': 'that you were injured',
    'has_attorney': 'that you don\'t have an attorney',
    'first_name': 'your first name',
    'last_name': 'your last name',
    'email': 'your email address',
    'phone': 'your phone number',
    'city': 'your city',
    'state': 'your state',
    'zip_code': 'your zip code',
    'date_of_incident': 'when the incident occurred',
    'at_fault': 'who was at fault',
    'lp_campaign_id': '', // Skip internal fields
    'lp_supplier_id': '',
    'lp_key': '',
    'ip_address': '',
    'acknowledged_intro': '',
  };

  return fieldDisplayMap[fieldName] || '';
}

/**
 * GET /api/chat - Health check for chat API
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    message: 'Chat API is operational. Use POST to interact.',
  });
}
