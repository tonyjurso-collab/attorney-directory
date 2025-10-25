import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const attorneyId = '844baebd-2efb-4f1b-99c7-4de6abfaacb4';
    
    console.log('Testing Algolia update using simple-index pattern...');
    console.log('Attorney ID:', attorneyId);

    // Get attorney from Supabase
    const supabase = await import('@supabase/supabase-js').then(m => m.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ));

    const { data: attorney, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('id', attorneyId)
      .single();

    if (error || !attorney) {
      return NextResponse.json({ error: 'Attorney not found' }, { status: 404 });
    }

    // Update bio with timestamp
    attorney.bio = 'Simple test bio updated at ' + new Date().toISOString();

    console.log('Attorney data:', attorney);

    // Import and initialize Algolia - using EXACT same pattern as simple-index
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('attorneys');

    // Transform attorney for Algolia
    const algoliaAttorney = {
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
      latitude: attorney.latitude,
      longitude: attorney.longitude,
      formatted_address: attorney.formatted_address,
      _geoloc: attorney.latitude && attorney.longitude ? {
        lat: attorney.latitude,
        lng: attorney.longitude,
      } : undefined,
    };

    console.log('Indexing attorney to Algolia...');
    console.log('Algolia data:', JSON.stringify(algoliaAttorney, null, 2));
    
    // Index attorney to Algolia - same method as simple-index
    await index.saveObjects([algoliaAttorney]);

    console.log('Successfully indexed attorney');

    return NextResponse.json({ 
      success: true,
      message: 'Successfully updated attorney in Algolia',
      data: algoliaAttorney
    });
  } catch (error) {
    console.error('Error in simple test update route:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
