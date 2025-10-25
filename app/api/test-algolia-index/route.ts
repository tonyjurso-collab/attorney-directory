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
    const index = client.initIndex('attorneys');

    // Test 1: Get index settings
    console.log('Getting index settings...');
    const settings = await index.getSettings();
    
    // Test 2: Search for all records (empty query)
    console.log('Searching for all records...');
    const allResults = await index.search('', {
      hitsPerPage: 100
    });
    
    // Test 3: Search for "sarah"
    console.log('Searching for "sarah"...');
    const sarahResults = await index.search('sarah', {
      hitsPerPage: 20
    });
    
    // Test 4: Search for "Sarah" (capitalized)
    console.log('Searching for "Sarah"...');
    const sarahCapitalResults = await index.search('Sarah', {
      hitsPerPage: 20
    });
    
    // Test 5: Search for any name containing "s"
    console.log('Searching for "s"...');
    const sResults = await index.search('s', {
      hitsPerPage: 20
    });

    return NextResponse.json({
      message: 'Algolia index test completed',
      settings: {
        searchableAttributes: settings.searchableAttributes,
        attributesForFaceting: settings.attributesForFaceting,
        customRanking: settings.customRanking
      },
      results: {
        totalRecords: allResults.nbHits,
        allHits: allResults.hits.map(hit => ({
          objectID: hit.objectID,
          name: hit.name,
          city: hit.city,
          state: hit.state
        })),
        sarahSearch: {
          query: 'sarah',
          totalHits: sarahResults.nbHits,
          hits: sarahResults.hits.map(hit => ({
            objectID: hit.objectID,
            name: hit.name,
            city: hit.city,
            state: hit.state
          }))
        },
        sarahCapitalSearch: {
          query: 'Sarah',
          totalHits: sarahCapitalResults.nbHits,
          hits: sarahCapitalResults.hits.map(hit => ({
            objectID: hit.objectID,
            name: hit.name,
            city: hit.city,
            state: hit.state
          }))
        },
        sSearch: {
          query: 's',
          totalHits: sResults.nbHits,
          hits: sResults.hits.map(hit => ({
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
