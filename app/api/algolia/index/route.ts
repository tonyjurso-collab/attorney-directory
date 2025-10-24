import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { algoliasearch } from 'algoliasearch';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

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
      return NextResponse.json({ error: 'Failed to fetch attorneys' }, { status: 500 });
    }

    if (!attorneys || attorneys.length === 0) {
      return NextResponse.json({ message: 'No attorneys found to index' }, { status: 200 });
    }

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
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('attorneys');

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

    // Index attorneys to Algolia
    await index.saveObjects(algoliaAttorneys);

    return NextResponse.json({ 
      message: `Successfully indexed ${transformedAttorneys.length} attorneys`,
      count: transformedAttorneys.length
    });
  } catch (error) {
    console.error('Error in index route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
