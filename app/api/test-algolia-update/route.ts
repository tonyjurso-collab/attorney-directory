import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attorneyId, bio } = body;

    console.log('Testing Algolia update with initIndex...');
    console.log('Attorney ID:', attorneyId);
    console.log('New bio:', bio);

    // Get attorney data from Supabase
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

    // Update the bio in the attorney object
    const updatedAttorney = { ...attorney, bio };

    // Initialize Algolia client using the same pattern as working routes
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );
    const index = (client as any).initIndex('attorneys');

    // Transform attorney for Algolia
    const algoliaData = {
      objectID: updatedAttorney.id,
      name: `${updatedAttorney.first_name} ${updatedAttorney.last_name}`,
      firm_name: updatedAttorney.firm_name,
      bio: updatedAttorney.bio,
      experience_years: updatedAttorney.experience_years,
      phone: updatedAttorney.phone,
      email: updatedAttorney.email,
      website: updatedAttorney.website,
      city: updatedAttorney.city,
      state: updatedAttorney.state,
      zip_code: updatedAttorney.zip_code,
      membership_tier: updatedAttorney.membership_tier,
      is_verified: updatedAttorney.is_verified,
      latitude: updatedAttorney.latitude,
      longitude: updatedAttorney.longitude,
      formatted_address: updatedAttorney.formatted_address,
      _geoloc: updatedAttorney.latitude && updatedAttorney.longitude ? {
        lat: updatedAttorney.latitude,
        lng: updatedAttorney.longitude,
      } : undefined,
    };

    console.log('Indexing to Algolia...', JSON.stringify(algoliaData, null, 2));

    // Save to Algolia
    await index.saveObject(algoliaData);

    console.log('Successfully updated in Algolia');

    return NextResponse.json({
      success: true,
      message: 'Attorney updated in Algolia successfully',
      data: algoliaData,
    });
  } catch (error: any) {
    console.error('Error updating attorney in Algolia:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
