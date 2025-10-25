import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing with same config as working test page...');
    
    // Use the exact same configuration as the test page
    const { liteClient } = await import('algoliasearch/lite');
    const client = liteClient(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
    );
    
    console.log('✅ Client created with same config as test page');
    
    // Test 1: Empty search (exactly like test page)
    console.log('🧪 Test 1: Empty search');
    const emptySearch = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: '',
        hitsPerPage: 20
      }]
    });
    
    const emptyResult = emptySearch.results[0] as any;
    console.log('📊 Empty search results:', {
      totalHits: emptyResult?.nbHits,
      hits: emptyResult?.hits?.length,
      processingTime: emptyResult?.processingTimeMS
    });
    
    // Test 2: Search for "sarah" (exactly like test page)
    console.log('🧪 Test 2: Search for "sarah"');
    const sarahSearch = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'sarah',
        hitsPerPage: 20
      }]
    });
    
    const sarahResult = sarahSearch.results[0] as any;
    console.log('📊 Sarah search results:', {
      totalHits: sarahResult?.nbHits,
      hits: sarahResult?.hits?.length,
      processingTime: sarahResult?.processingTimeMS
    });
    
    // Test 3: Search for "Sarah" (capitalized)
    console.log('🧪 Test 3: Search for "Sarah"');
    const SarahSearch = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'Sarah',
        hitsPerPage: 20
      }]
    });
    
    const SarahResult = SarahSearch.results[0] as any;
    console.log('📊 Sarah (capitalized) search results:', {
      totalHits: SarahResult?.nbHits,
      hits: SarahResult?.hits?.length,
      processingTime: SarahResult?.processingTimeMS
    });
    
    return NextResponse.json({
      message: 'Same config test completed',
      results: {
        empty: {
          totalHits: emptyResult?.nbHits,
          hits: emptyResult?.hits?.length,
          processingTime: emptyResult?.processingTimeMS
        },
        sarah: {
          totalHits: sarahResult?.nbHits,
          hits: sarahResult?.hits?.length,
          processingTime: sarahResult?.processingTimeMS
        },
        Sarah: {
          totalHits: SarahResult?.nbHits,
          hits: SarahResult?.hits?.length,
          processingTime: SarahResult?.processingTimeMS
        }
      },
      sampleHits: {
        empty: emptyResult?.hits?.slice(0, 2) || [],
        sarah: sarahResult?.hits || [],
        Sarah: SarahResult?.hits || []
      }
    });
    
  } catch (error) {
    console.error('❌ Same config test error:', error);
    return NextResponse.json({ 
      error: 'Same config test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
