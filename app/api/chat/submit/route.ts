import { NextRequest, NextResponse } from 'next/server';
import { submitLead } from '@/lib/chat/remote-api-client';
import { logger } from '@/lib/logging/logger';
import { ChatError } from '@/lib/errors/chat-error';

/**
 * POST /api/chat/submit - Proxy to remote PHP lead submission API
 * Maintains backward compatibility with existing Next.js format
 */
export async function POST(request: NextRequest) {
  let sessionId: string | undefined;
  
  try {
    const { sessionId: sid, trackingData } = await request.json();
    sessionId = sid;
    
    logger.info(`Proxying lead submission to remote API for session: ${sessionId}`);

    if (!sessionId) {
      throw new ChatError('Session ID is required for lead submission.', 'INVALID_REQUEST', 400);
    }

    // Call remote PHP API to submit lead
    const result = await submitLead(sessionId, trackingData || {}, trackingData);

    logger.info(`Lead submission successful for session ${sessionId}`, {
      leadId: result.leadId,
      status: result.status,
    });

    return NextResponse.json({
      status: result.status,
      leadId: result.leadId,
      message: result.message || 'Your information has been submitted successfully. You should hear from qualified attorneys soon.',
    });

  } catch (error) {
    logger.error(`Lead submission error for session ${sessionId || 'N/A'}:`, error instanceof Error ? error.message : String(error));

    if (error instanceof ChatError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to submit lead.',
        code: 'LEAD_SUBMISSION_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/submit - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    mode: 'remote',
  });
}