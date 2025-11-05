import { NextRequest, NextResponse } from 'next/server';
import { algoliasearch } from 'algoliasearch';

/**
 * Test API to add a single attorney with geo coordinates to Algolia
 * This helps verify that geo search is working
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Algolia client
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    // Test attorney with coordinates near Clifton, NJ
    const testAttorney = {
      objectID: 'test-attorney-nj-001',
      name: 'John Smith',
      firm_name: 'Smith & Associates',
      bio: 'Experienced family law attorney serving the New Jersey area.',
      experience_years: 15,
      phone: '(973) 555-0101',
      email: 'john@smithlaw.com',
      website: 'https://smithlaw.com',
      city: 'Clifton',
      state: 'NJ',
      zip_code: '07013',
      membership_tier: 'standard',
      is_verified: true,
      practice_areas: [
        {
          name: 'Family Law',
          slug: 'family-law',
          is_primary: true
        },
        {
          name: 'Divorce',
          slug: 'divorce',
          is_primary: false
        }
      ],
      average_rating: 4.7,
      review_count: 89,
      // Geo coordinates for Clifton, NJ
      latitude: 40.8654,
      longitude: -74.1610,
      formatted_address: 'Clifton, NJ, USA',
      _geoloc: {
        lat: 40.8654,
        lng: -74.1610
      }
    };

    // Add the test attorney to Algolia using v5 API
    await client.saveObjects({
      indexName: 'attorneys',
      objects: [testAttorney],
    });

    return NextResponse.json({
      message: 'Test attorney added to Algolia with geo coordinates',
      attorney: testAttorney,
      success: true
    });

  } catch (error) {
    console.error('Error adding test attorney:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET endpoint to test geo search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '25';

    if (!lat || !lng) {
      return NextResponse.json({
        error: 'Missing parameters',
        message: 'Please provide lat and lng parameters',
        example: '/api/test-algolia-geo?lat=40.8654&lng=-74.1610&radius=25'
      }, { status: 400 });
    }

    // Initialize Algolia client
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
    );

    // Test geo search using v5 API
    const searchResponse = await client.search({
      requests: [{
        indexName: 'attorneys',
        query: '',
        aroundLatLng: `${lat},${lng}`,
        aroundRadius: parseInt(radius) * 1609.34, // Convert miles to meters
        hitsPerPage: 10,
      }],
    });

    const searchResults = searchResponse.results[0] as any;

    return NextResponse.json({
      message: 'Geo search test results',
      searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: `${radius} miles`,
      results: searchResults.hits,
      totalHits: searchResults.nbHits
    });

  } catch (error) {
    console.error('Error testing geo search:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
