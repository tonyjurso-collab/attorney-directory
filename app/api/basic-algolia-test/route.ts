import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting basic Algolia test...');
    
    // Check environment variables first
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
    
    // Try dynamic import
    console.log('📦 Attempting to import algoliasearch...');
    const { algoliasearch } = await import('algoliasearch');
    console.log('✅ algoliasearch imported successfully');
    
    // Try to create client
    console.log('🔧 Creating Algolia client...');
    const client = algoliasearch(appId, adminKey);
    console.log('✅ Client created successfully');
    
    // Try to list indices (this requires admin key)
    console.log('📋 Listing indices...');
    const indices = await client.listIndices();
    console.log('✅ Indices listed successfully:', indices);
    
    // Check if attorneys index exists
    const attorneysIndex = indices.items.find((index: any) => index.name === 'attorneys');
    
    return NextResponse.json({
      message: 'Basic Algolia test successful',
      indices: indices.items.map((index: any) => ({
        name: index.name,
        entries: index.entries,
        dataSize: index.dataSize,
        fileSize: index.fileSize
      })),
      attorneysIndexExists: !!attorneysIndex,
      attorneysIndex: attorneysIndex ? {
        name: attorneysIndex.name,
        entries: attorneysIndex.entries,
        dataSize: attorneysIndex.dataSize
      } : null
    });
    
  } catch (error) {
    console.error('❌ Basic Algolia test failed:', error);
    return NextResponse.json({ 
      error: 'Basic Algolia test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      name: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 });
  }
}
