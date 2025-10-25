import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting import test...');
    
    // Test 1: Try to import algoliasearch
    try {
      const { algoliasearch } = await import('algoliasearch');
      console.log('✅ algoliasearch imported successfully');
      
      // Test 2: Check environment variables
      const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
      const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
      
      console.log('Environment check:', {
        appId: appId ? 'SET' : 'NOT SET',
        adminKey: adminKey ? 'SET' : 'NOT SET'
      });
      
      if (!appId || !adminKey) {
        return NextResponse.json({ 
          error: 'Environment variables not set',
          appId: !!appId,
          adminKey: !!adminKey
        }, { status: 500 });
      }
      
      // Test 3: Try to create client
      try {
        const client = algoliasearch(appId, adminKey);
        console.log('✅ Client created successfully');
        
        return NextResponse.json({ 
          message: 'All tests passed',
          status: 'success'
        });
        
      } catch (clientError) {
        console.error('❌ Client creation failed:', clientError);
        return NextResponse.json({ 
          error: 'Client creation failed',
          details: clientError instanceof Error ? clientError.message : 'Unknown error'
        }, { status: 500 });
      }
      
    } catch (importError) {
      console.error('❌ Import failed:', importError);
      return NextResponse.json({ 
        error: 'Import failed',
        details: importError instanceof Error ? importError.message : 'Unknown import error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
    return NextResponse.json({ 
      error: 'General error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
