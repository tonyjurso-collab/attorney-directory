import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Initialize Algolia client
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );

    // Configure the index settings using v5 API
    await client.setSettings({
      indexName: 'attorneys',
      indexSettings: {
      // Searchable attributes (in order of importance)
      searchableAttributes: [
        'name',
        'firm_name',
        'practice_areas.name',
        'bio',
        'city',
        'state',
        'zip_code',
        'formatted_address' // Include formatted address in search
      ],

      // Attributes for faceting (filtering)
      attributesForFaceting: [
        'searchable(practice_areas.name)',
        'membership_tier',
        'is_verified',
        'city',
        'state',
        // Add geo search to faceting
        'searchable(_geoloc)'
      ],

      // Custom ranking
      customRanking: [
        'desc(membership_tier)', // Exclusive first, then Standard, then Free
        'desc(average_rating)',
        'desc(review_count)',
        'desc(experience_years)'
      ],

      // Highlighting
      attributesToHighlight: [
        'name',
        'firm_name',
        'bio',
        'practice_areas.name'
      ],

      // Snippeting
      attributesToSnippet: [
        'bio:20'
      ],

      // Distinct
      attributeForDistinct: 'objectID',

      // Hits per page
      hitsPerPage: 20,

      // Max values per facet
      maxValuesPerFacet: 100

      // Geo search is automatically enabled when _geoloc attribute is present
      // _geoloc is the special attribute name for geo coordinates in Algolia

      // Note: Synonyms are managed separately using saveSynonyms() method in Algolia v5
      // They cannot be set as part of indexSettings
      }
    });

    return NextResponse.json({ 
      message: 'Successfully configured Algolia index',
      success: true
    });
  } catch (error) {
    console.error('Error in setup route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
