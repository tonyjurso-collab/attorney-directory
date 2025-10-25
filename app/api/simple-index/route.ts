import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting simple indexing...');
    
    // Get attorneys from Supabase
    const supabase = await createClient();
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching attorneys:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys' }, { status: 500 });
    }

    if (!attorneys || attorneys.length === 0) {
      return NextResponse.json({ message: 'No attorneys found to index' });
    }

    console.log(`Found ${attorneys.length} attorneys to index`);

    // Import and initialize Algolia
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = client.initIndex('attorneys');

    // Transform attorneys for Algolia
    const algoliaAttorneys = attorneys.map(attorney => ({
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
    }));

    console.log('Indexing attorneys to Algolia...');
    
    // Index attorneys to Algolia
    await index.saveObjects(algoliaAttorneys);

    console.log('Successfully indexed attorneys');

    return NextResponse.json({ 
      message: `Successfully indexed ${attorneys.length} attorneys`,
      count: attorneys.length
    });
  } catch (error) {
    console.error('Error in simple-index route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
