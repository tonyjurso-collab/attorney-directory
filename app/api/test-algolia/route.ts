import { NextRequest, NextResponse } from 'next/server';
import { algoliasearch } from 'algoliasearch';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    
    console.log('Environment check:', {
      appId: appId ? 'SET' : 'NOT SET',
      adminKey: adminKey ? 'SET' : 'NOT SET'
    });

    if (!appId || !adminKey) {
      return NextResponse.json({ 
        error: 'Algolia environment variables not set',
        appId: !!appId,
        adminKey: !!adminKey
      }, { status: 500 });
    }

    // Test Algolia connection
    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex('attorneys');

    // Try to get index settings
    const settings = await index.getSettings();
    
    return NextResponse.json({ 
      message: 'Algolia connection successful',
      settings: settings
    });
  } catch (error) {
    console.error('Algolia test error:', error);
    return NextResponse.json({ 
      error: 'Algolia connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error
    }, { status: 500 });
  }
}
