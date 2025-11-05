import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Algolia index contents...');
    
    // Dynamic import to avoid build issues
    const { algoliasearch } = await import('algoliasearch');
    
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    
    if (!appId || !adminKey) {
      return NextResponse.json({ 
        error: 'Algolia API keys not configured',
        appId: !!appId,
        adminKey: !!adminKey
      }, { status: 500 });
    }
    
    const client = algoliasearch(appId, adminKey);
    
    // Get index stats using v5 API
    const stats = await client.getSettings({
      indexName: 'attorneys',
    });
    console.log('📊 Index settings:', stats);
    
    // Try to search for anything using v5 API
    const searchResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: '',
        hitsPerPage: 10,
      }],
    });
    const searchResult = searchResponse.results[0] as any;
    
    console.log('🔍 Search results:', {
      totalHits: searchResult.nbHits,
      hits: searchResult.hits.length,
      processingTime: searchResult.processingTimeMS
    });
    
    // Try specific searches using v5 API
    const sarahResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'sarah',
        hitsPerPage: 5,
      }],
    });
    const sarahSearch = sarahResponse.results[0] as any;
    
    const sarahResponse2 = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'Sarah',
        hitsPerPage: 5,
      }],
    });
    const sarahSearch2 = sarahResponse2.results[0] as any;
    
    const sarahResponse3 = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 's',
        hitsPerPage: 5,
      }],
    });
    const sarahSearch3 = sarahResponse3.results[0] as any;
    
    console.log('🔍 Sarah searches:', {
      'sarah': sarahSearch.nbHits,
      'Sarah': sarahSearch2.nbHits,
      's': sarahSearch3.nbHits
    });
    
    return NextResponse.json({
      message: 'Algolia index test completed',
      indexStats: {
        totalHits: searchResult.nbHits,
        processingTime: searchResult.processingTimeMS
      },
      searches: {
        empty: searchResult.nbHits,
        'sarah': sarahSearch.nbHits,
        'Sarah': sarahSearch2.nbHits,
        's': sarahSearch3.nbHits
      },
      sampleHits: searchResult.hits.slice(0, 2), // First 2 hits for inspection
      settings: {
        searchableAttributes: stats.searchableAttributes,
        attributesForFaceting: stats.attributesForFaceting
      }
    });
    
  } catch (error) {
    console.error('❌ Algolia test error:', error);
    return NextResponse.json({ 
      error: 'Algolia test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
