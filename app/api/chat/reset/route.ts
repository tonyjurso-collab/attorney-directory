import { NextRequest, NextResponse } from 'next/server';
import { resetSession } from '@/lib/chat/remote-api-client';
import { logger } from '@/lib/logging/logger';

/**
 * POST /api/chat/reset - Proxy to remote PHP session reset API
 * Maintains backward compatibility with existing Next.js format
 */
export async function POST(request: NextRequest) {
  try {
    let sessionId: string | undefined;
    
    try {
      const body = await request.json();
      sessionId = body.session_id;
    } catch (error) {
      // Request body might be empty or invalid JSON, that's okay
    }
    
    if (!sessionId) {
      logger.debug('No session ID provided for reset');
      return NextResponse.json({ 
        success: true,
        message: 'No session to reset' 
      });
    }
    
    logger.info(`Proxying session reset to remote API: ${sessionId}`);
    
    // Call remote PHP API to reset session
    const result = await resetSession(sessionId);
    
    logger.info(`Session reset successful for ${sessionId}`, {
      success: result.success,
    });
    
    return NextResponse.json({ 
      success: result.success,
      message: result.message,
      session_id: result.session_id,
    });
    
  } catch (error) {
    logger.error('Session reset error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to reset session', success: false },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/reset - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    mode: 'remote',
  });
}