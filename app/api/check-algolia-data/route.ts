import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Algolia data...');
    
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('attorneys');
    
    // Just try to get all records
    console.log('🔍 Getting all records...');
    const allRecords = await index.search('', {
      hitsPerPage: 50
    });
    
    console.log('📊 All records:', {
      totalHits: allRecords.nbHits,
      hits: allRecords.hits.length,
      processingTime: allRecords.processingTimeMS
    });
    
    // Log the actual records
    if (allRecords.hits.length > 0) {
      console.log('📋 First record:', JSON.stringify(allRecords.hits[0], null, 2));
    }
    
    return NextResponse.json({
      message: 'Algolia data check completed',
      totalHits: allRecords.nbHits,
      hitsCount: allRecords.hits.length,
      processingTime: allRecords.processingTimeMS,
      records: allRecords.hits.map((hit: any) => ({
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
