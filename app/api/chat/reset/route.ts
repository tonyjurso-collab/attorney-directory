import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, ChatSession } from '@/lib/chat/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<ChatSession>(await cookies(), sessionOptions);
    
    // Clear all session data
    session.collectedFields = {};
    session.conversationHistory = [];
    session.conversationStep = 'collecting_fields';
    session.category = undefined;
    session.subcategory = undefined;
    
    await session.save();
    
    console.log('Chat session reset');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset API error:', error);
    return NextResponse.json(
      { error: 'Failed to reset session' },
      { status: 500 }
    );
  }
}