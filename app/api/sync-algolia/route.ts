import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Sync attorneys from Supabase to Algolia search index
 * This endpoint syncs all active attorneys with their practice areas to Algolia
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Algolia sync...');
    
    const supabase = await createClient();
    
    // Get all active attorneys with their practice areas
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select(`
        *,
        attorney_practice_areas (
          practice_area_id,
          is_primary,
          practice_areas (
            id,
            name,
            slug,
            description
          )
        )
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching attorneys:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys', details: error }, { status: 500 });
    }

    if (!attorneys || attorneys.length === 0) {
      return NextResponse.json({ message: 'No attorneys found to sync' }, { status: 200 });
    }

    console.log(`📊 Found ${attorneys.length} attorneys in Supabase`);

    // Transform the data to match our component expectations
    const transformedAttorneys = attorneys.map((attorney: any) => ({
      ...attorney,
      practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
        id: apa.practice_areas?.id,
        name: apa.practice_areas?.name,
        slug: apa.practice_areas?.slug,
        description: apa.practice_areas?.description,
        is_primary: apa.is_primary,
      })).filter(pa => pa.id) || [],
    }));

    // Initialize Algolia client
    const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const algoliaAdminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    
    if (!algoliaAppId || !algoliaAdminKey) {
      return NextResponse.json({ error: 'Algolia credentials not configured' }, { status: 500 });
    }

    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(algoliaAppId, algoliaAdminKey);

    // Transform attorneys for Algolia
    const algoliaAttorneys = transformedAttorneys.map(attorney => ({
      objectID: attorney.id,
      name: `${attorney.first_name} ${attorney.last_name}`,
      firm_name: attorney.firm_name,
      bio: attorney.bio,
      experience_years: attorney.experience_years,
      phone: attorney.phone,
      email: attorney.email,
      website: attorney.website,
      city: attorney.city,
      state: attorney.state,
      zip_code: attorney.zip_code,
      membership_tier: attorney.membership_tier,
      is_verified: attorney.is_verified,
      practice_areas: attorney.practice_areas.map(pa => ({
        name: pa.name,
        slug: pa.slug,
        is_primary: pa.is_primary,
      })),
      average_rating: attorney.average_rating,
      review_count: attorney.review_count,
      // Include geocoding data
      latitude: attorney.latitude,
      longitude: attorney.longitude,
      formatted_address: attorney.formatted_address,
      _geoloc: attorney.latitude && attorney.longitude ? {
        lat: attorney.latitude,
        lng: attorney.longitude,
      } : undefined,
    }));

    console.log(`📤 Syncing ${algoliaAttorneys.length} attorneys to Algolia...`);

    // Index attorneys to Algolia using v5 API
    await client.saveObjects({
      indexName: 'attorneys',
      objects: algoliaAttorneys,
    });

    console.log('✅ Successfully synced attorneys to Algolia');

    return NextResponse.json({ 
      message: `Successfully synced ${transformedAttorneys.length} attorneys to Algolia`,
      count: transformedAttorneys.length,
      attorneys: algoliaAttorneys.map(a => ({ id: a.objectID, name: a.name, city: a.city, state: a.state }))
    });
  } catch (error) {
    console.error('Error in sync route:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
