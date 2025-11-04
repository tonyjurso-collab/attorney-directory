import { NextRequest, NextResponse } from 'next/server';
import { generateArticleMetadata } from '@/lib/articles/ai-metadata';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title } = body;

    // Validate input
    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      );
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.' },
        { status: 500 }
      );
    }

    console.log('Generating metadata for article:', title);

    // Generate metadata
    const metadata = await generateArticleMetadata(content, title);

    console.log('Metadata generated successfully:', metadata);

    return NextResponse.json({
      success: true,
      ...metadata
    });

  } catch (error: any) {
    console.error('Error in POST /api/articles/generate-metadata:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate metadata', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
