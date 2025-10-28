import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    return NextResponse.json({
      reply: `You said: ${message}`,
      complete: false,
      session_id: 'test-session',
      debug: {
        message: message,
        timestamp: new Date().toISOString(),
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
