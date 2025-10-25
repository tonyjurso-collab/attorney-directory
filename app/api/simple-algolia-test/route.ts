import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test if we can import algoliasearch
    let algoliasearch;
    try {
      const algoliaModule = await import('algoliasearch');
      algoliasearch = algoliaModule.algoliasearch;
      console.log('✅ algoliasearch imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import algoliasearch:', importError);
      return NextResponse.json({ 
        error: 'Failed to import algoliasearch',
        details: importError instanceof Error ? importError.message : 'Unknown import error'
      }, { status: 500 });
    }

    // Test environment variables
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    
    if (!appId || !adminKey) {
      return NextResponse.json({ 
        error: 'Algolia environment variables not set',
        appId: !!appId,
        adminKey: !!adminKey
      }, { status: 500 });
    }

    // Test creating client
    let client;
    try {
      client = algoliasearch(appId, adminKey);
      console.log('✅ Algolia client created successfully');
    } catch (clientError) {
      console.error('❌ Failed to create Algolia client:', clientError);
      return NextResponse.json({ 
        error: 'Failed to create Algolia client',
        details: clientError instanceof Error ? clientError.message : 'Unknown client error'
      }, { status: 500 });
    }

    // Test creating index
    let index;
    try {
      index = client.initIndex('attorneys');
      console.log('✅ Algolia index created successfully');
    } catch (indexError) {
      console.error('❌ Failed to create Algolia index:', indexError);
      return NextResponse.json({ 
        error: 'Failed to create Algolia index',
        details: indexError instanceof Error ? indexError.message : 'Unknown index error'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'All Algolia tests passed',
      steps: [
        'algoliasearch imported',
        'environment variables loaded',
        'client created',
        'index created'
      ]
    });
  } catch (error) {
    console.error('Simple Algolia test error:', error);
    return NextResponse.json({ 
      error: 'Simple Algolia test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
