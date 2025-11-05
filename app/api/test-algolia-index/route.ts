import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Algolia index contents...');
    
    // Import and initialize Algolia
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    // Test 1: Get index settings using v5 API
    console.log('Getting index settings...');
    const settings = await client.getSettings({
      indexName: 'attorneys',
    });
    
    // Test 2: Search for all records (empty query) using v5 API
    console.log('Searching for all records...');
    const allResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: '',
        hitsPerPage: 100,
      }],
    });
    const allResults = allResponse.results[0] as any;
    
    // Test 3: Search for "sarah" using v5 API
    console.log('Searching for "sarah"...');
    const sarahResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'sarah',
        hitsPerPage: 20,
      }],
    });
    const sarahResults = sarahResponse.results[0] as any;
    
    // Test 4: Search for "Sarah" (capitalized) using v5 API
    console.log('Searching for "Sarah"...');
    const sarahCapitalResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'Sarah',
        hitsPerPage: 20,
      }],
    });
    const sarahCapitalResults = sarahCapitalResponse.results[0] as any;
    
    // Test 5: Search for any name containing "s" using v5 API
    console.log('Searching for "s"...');
    const sResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 's',
        hitsPerPage: 20,
      }],
    });
    const sResults = sResponse.results[0] as any;

    return NextResponse.json({
      message: 'Algolia index test completed',
      settings: {
        searchableAttributes: settings.searchableAttributes,
        attributesForFaceting: settings.attributesForFaceting,
        customRanking: settings.customRanking
      },
      results: {
        totalRecords: allResults.nbHits,
        allHits: allResults.hits.map((hit: any) => ({
          objectID: hit.objectID,
          name: hit.name,
          city: hit.city,
          state: hit.state
        })),
        sarahSearch: {
          query: 'sarah',
          totalHits: sarahResults.nbHits,
          hits: sarahResults.hits.map((hit: any) => ({
            objectID: hit.objectID,
            name: hit.name,
            city: hit.city,
            state: hit.state
          }))
        },
        sarahCapitalSearch: {
          query: 'Sarah',
          totalHits: sarahCapitalResults.nbHits,
          hits: sarahCapitalResults.hits.map((hit: any) => ({
            objectID: hit.objectID,
            name: hit.name,
            city: hit.city,
            state: hit.state
          }))
        },
        sSearch: {
          query: 's',
          totalHits: sResults.nbHits,
          hits: sResults.hits.map((hit: any) => ({
            objectID: hit.objectID,
            name: hit.name,
            city: hit.city,
            state: hit.state
          }))
        }
      }
    });
  } catch (error) {
    console.error('Algolia index test error:', error);
    return NextResponse.json({ 
      error: 'Algolia index test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
