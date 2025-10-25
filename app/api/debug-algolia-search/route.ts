import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, practice_area, tier, location, radius } = await request.json();
    
    console.log('🔍 Debug Algolia Search Parameters:', {
      query,
      practice_area,
      tier,
      location,
      radius
    });
    
    const { liteClient } = await import('algoliasearch/lite');
    const client = liteClient(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
    );
    
    // Build search parameters exactly like the component does
    const searchParams: any = {
      indexName: 'attorneys',
      query: query || '',
      hitsPerPage: 20,
      filters: []
    };
    
    // Add practice area filter
    if (practice_area) {
      searchParams.filters.push(`practice_areas.name:"${practice_area}"`);
    }
    
    // Add tier filter
    if (tier) {
      searchParams.filters.push(`membership_tier:"${tier}"`);
    }
    
    // Add geo search if we have coordinates
    if (location && radius && radius > 0) {
      const radiusInMeters = Math.round(radius * 1609.34);
      searchParams.aroundLatLng = `${location.latitude},${location.longitude}`;
      searchParams.aroundRadius = radiusInMeters;
    }
    
    console.log('📤 Final search parameters:', searchParams);
    
    // Perform the search
    const searchResponse = await client.search({
      requests: [searchParams]
    });
    
    const result = searchResponse.results[0] as any;
    
    console.log('📥 Algolia response:', {
      totalHits: result?.nbHits,
      hits: result?.hits?.length,
      processingTime: result?.processingTimeMS
    });
    
    return NextResponse.json({
      message: 'Algolia search debug completed',
      searchParams,
      results: {
        totalHits: result?.nbHits,
        hits: result?.hits?.length,
        processingTime: result?.processingTimeMS,
        hits: result?.hits || []
      }
    });
    
  } catch (error) {
    console.error('❌ Algolia debug search error:', error);
    return NextResponse.json({ 
      error: 'Algolia debug search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
