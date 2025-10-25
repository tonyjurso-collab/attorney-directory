import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing Algolia connection...');
    
    // Import and initialize Algolia
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('attorneys');

    console.log('Trying to get index settings...');
    const settings = await index.getSettings();
    console.log('Settings retrieved:', settings);

    return NextResponse.json({ 
      message: 'Algolia connection successful',
      settings: settings
    });
  } catch (error) {
    console.error('Error in test-connect route:', error);
    return NextResponse.json({ 
      error: 'Algolia connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
