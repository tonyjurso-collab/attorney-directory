import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Algolia search functionality...');
    
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    // Test 1: Empty search (should return all records) using v5 API
    console.log('🔍 Test 1: Empty search...');
    const emptyResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: '',
        params: { hitsPerPage: 10 },
      }],
    });
    const emptySearch = emptyResponse.results[0];
    console.log('Empty search results:', {
      totalHits: emptySearch.nbHits,
      hits: emptySearch.hits.length,
      processingTime: emptySearch.processingTimeMS
    });
    
    // Test 2: Search for "sarah" using v5 API
    console.log('🔍 Test 2: Search for "sarah"...');
    const sarahResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'sarah',
        params: { hitsPerPage: 10 },
      }],
    });
    const sarahSearch = sarahResponse.results[0];
    console.log('Sarah search results:', {
      totalHits: sarahSearch.nbHits,
      hits: sarahSearch.hits.length,
      processingTime: sarahSearch.processingTimeMS
    });
    
    // Test 3: Search for "Sarah" using v5 API
    console.log('🔍 Test 3: Search for "Sarah"...');
    const SarahResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'Sarah',
        params: { hitsPerPage: 10 },
      }],
    });
    const SarahSearch = SarahResponse.results[0];
    console.log('Sarah (capitalized) search results:', {
      totalHits: SarahSearch.nbHits,
      hits: SarahSearch.hits.length,
      processingTime: SarahSearch.processingTimeMS
    });
    
    // Test 4: Search for "s" using v5 API
    console.log('🔍 Test 4: Search for "s"...');
    const sResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 's',
        params: { hitsPerPage: 10 },
      }],
    });
    const sSearch = sResponse.results[0];
    console.log('S search results:', {
      totalHits: sSearch.nbHits,
      hits: sSearch.hits.length,
      processingTime: sSearch.processingTimeMS
    });
    
    // Test 5: Search for "johnson" using v5 API
    console.log('🔍 Test 5: Search for "johnson"...');
    const johnsonResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'johnson',
        params: { hitsPerPage: 10 },
      }],
    });
    const johnsonSearch = johnsonResponse.results[0];
    console.log('Johnson search results:', {
      totalHits: johnsonSearch.nbHits,
      hits: johnsonSearch.hits.length,
      processingTime: johnsonSearch.processingTimeMS
    });
    
    // Test 6: Search for "personal" using v5 API
    console.log('🔍 Test 6: Search for "personal"...');
    const personalResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: 'personal',
        params: { hitsPerPage: 10 },
      }],
    });
    const personalSearch = personalResponse.results[0];
    console.log('Personal search results:', {
      totalHits: personalSearch.nbHits,
      hits: personalSearch.hits.length,
      processingTime: personalSearch.processingTimeMS
    });
    
    return NextResponse.json({
      message: 'Algolia search test completed',
      results: {
        empty: {
          totalHits: emptySearch.nbHits,
          hits: emptySearch.hits.length,
          processingTime: emptySearch.processingTimeMS
        },
        sarah: {
          totalHits: sarahSearch.nbHits,
          hits: sarahSearch.hits.length,
          processingTime: sarahSearch.processingTimeMS
        },
        Sarah: {
          totalHits: SarahSearch.nbHits,
          hits: SarahSearch.hits.length,
          processingTime: SarahSearch.processingTimeMS
        },
        s: {
          totalHits: sSearch.nbHits,
          hits: sSearch.hits.length,
          processingTime: sSearch.processingTimeMS
        },
        johnson: {
          totalHits: johnsonSearch.nbHits,
          hits: johnsonSearch.hits.length,
          processingTime: johnsonSearch.processingTimeMS
        },
        personal: {
          totalHits: personalSearch.nbHits,
          hits: personalSearch.hits.length,
          processingTime: personalSearch.processingTimeMS
        }
      },
      sampleHits: {
        empty: emptySearch.hits.slice(0, 2),
        sarah: sarahSearch.hits,
        Sarah: SarahSearch.hits,
        s: sSearch.hits,
        johnson: johnsonSearch.hits,
        personal: personalSearch.hits
      }
    });
    
  } catch (error) {
    console.error('❌ Algolia search test failed:', error);
    return NextResponse.json({ 
      error: 'Algolia search test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
