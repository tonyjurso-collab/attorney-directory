import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing Algolia save...');
    
    // Import and initialize Algolia
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('attorneys');

    // Test with a simple object
    const testObject = {
      objectID: 'test-123',
      name: 'Test Attorney',
      city: 'Test City',
      state: 'TS'
    };

    console.log('Saving test object to Algolia...');
    await index.saveObject(testObject);
    console.log('Test object saved successfully');

    return NextResponse.json({ 
      message: 'Test object saved successfully'
    });
  } catch (error) {
    console.error('Error in test-save route:', error);
    return NextResponse.json({ 
      error: 'Test save failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
