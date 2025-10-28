import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage } from '@/lib/chat/remote-api-client';
import { logger } from '@/lib/logging/logger';
import { ChatError } from '@/lib/errors/chat-error';

/**
 * POST /api/chat - Proxy to remote PHP chat API
 * Maintains backward compatibility with existing Next.js format
 */
export async function POST(request: NextRequest) {
  try {
    const { message, meta, session_id } = await request.json();
    
    logger.info(`Proxying chat message to remote API: "${message}"`, { meta, session_id });

    // IMPORTANT: Always pass through the session_id from client
    // The remote API will create a new session if session_id is missing
    // Do NOT generate a new one here or we'll break session continuity
    const response = await sendChatMessage(
      message,
      meta?.category,
      meta?.subcategory,
      session_id || undefined // Pass undefined if null, let remote API handle it
    );

    logger.debug('Remote chat response received', {
      sessionId: response.session_id,
      complete: response.complete,
      stage: response.debug?.stage,
    });

    // Return response in Next.js format (already adapted)
    return NextResponse.json(response);

  } catch (error) {
    logger.error('Chat proxy error:', error instanceof Error ? error.message : String(error));
    
    const errorMessage = "I'm having trouble connecting right now. Please try again in a moment, or feel free to call us directly.";
    
    return NextResponse.json(
      {
        reply: errorMessage,
        complete: false,
        error: error instanceof ChatError ? error.message : 'An unexpected error occurred.',
        errorCode: error instanceof ChatError ? error.code : 'UNKNOWN_ERROR',
      },
      { status: error instanceof ChatError ? error.statusCode : 500 }
    );
  }
}

/**
 * GET /api/chat - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    mode: 'remote',
  });
}