import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // Simple response for testing
    return NextResponse.json({
      reply: `I received your message: "${message}". This is a test response from the new chat system.`,
      complete: false,
      session_id: 'test-session-123',
      debug: {
        message: message,
        timestamp: new Date().toISOString(),
        status: 'working'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        reply: "I'm having trouble processing your request.",
        complete: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
