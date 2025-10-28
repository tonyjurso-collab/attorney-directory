// Simple script to sync Supabase data with Algolia
const { createClient } = require('@supabase/supabase-js');
const { algoliasearch } = require('algoliasearch');

async function syncAlgolia() {
  try {
    console.log('🔄 Starting Algolia sync...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get all active attorneys
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching attorneys:', error);
      return;
    }

    if (!attorneys || attorneys.length === 0) {
      console.log('No attorneys found to sync');
      return;
    }

    console.log(`📊 Found ${attorneys.length} attorneys in Supabase`);

    // Initialize Algolia client
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_API_KEY
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
      profile_image_url: attorney.profile_image_url,
      latitude: attorney.latitude,
      longitude: attorney.longitude,
      formatted_address: attorney.formatted_address,
      _geoloc: attorney.latitude && attorney.longitude ? {
        lat: attorney.latitude,
        lng: attorney.longitude,
      } : undefined,
    }));

    console.log(`📤 Syncing ${algoliaAttorneys.length} attorneys to Algolia...`);

    // Index attorneys to Algolia
    await index.saveObjects(algoliaAttorneys);

    console.log('✅ Successfully synced attorneys to Algolia');
    console.log(`📊 Synced ${algoliaAttorneys.length} attorneys`);
    
    // Show summary
    const withGeo = algoliaAttorneys.filter(a => a._geoloc).length;
    const withoutGeo = algoliaAttorneys.length - withGeo;
    console.log(`📍 With geo data: ${withGeo}`);
    console.log(`❌ Without geo data: ${withoutGeo}`);

  } catch (error) {
    console.error('Error in sync:', error);
  }
}

// Run the sync
syncAlgolia();
