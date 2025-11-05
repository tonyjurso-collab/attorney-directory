import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Algolia data...');
    
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    // Just try to get all records using v5 API
    console.log('🔍 Getting all records...');
    const allRecords = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: '',
        params: {
          hitsPerPage: 50,
        },
      }],
    });
    
    const searchResults = allRecords.results[0];
    
    console.log('📊 All records:', {
      totalHits: searchResults.nbHits,
      hits: searchResults.hits.length,
      processingTime: searchResults.processingTimeMS
    });
    
    // Log the actual records
    if (searchResults.hits.length > 0) {
      console.log('📋 First record:', JSON.stringify(searchResults.hits[0], null, 2));
    }
    
    return NextResponse.json({
      message: 'Algolia data check completed',
      totalHits: searchResults.nbHits,
      hitsCount: searchResults.hits.length,
      processingTime: searchResults.processingTimeMS,
      records: searchResults.hits.map((hit: any) => ({
        objectID: hit.objectID,
        name: hit.name,
        city: hit.city,
        state: hit.state,
        practice_areas: hit.practice_areas,
        _geoloc: hit._geoloc
      }))
    });
    
  } catch (error) {
    console.error('❌ Algolia data check failed:', error);
    return NextResponse.json({ 
      error: 'Algolia data check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
