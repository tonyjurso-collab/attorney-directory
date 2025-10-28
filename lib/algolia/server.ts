import { AttorneyWithDetails } from '@/lib/types/database';

// Get Algolia client (lazy initialization)
async function getAlgoliaClient() {
  if (!process.env.ALGOLIA_ADMIN_API_KEY || !process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
    console.log('Missing Algolia environment variables');
    console.log('APP_ID:', !!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID);
    console.log('ADMIN_KEY:', !!process.env.ALGOLIA_ADMIN_API_KEY);
    return null;
  }

  try {
    // Import using direct import like working routes
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_API_KEY
    );
    console.log('Algolia client initialized successfully');
    return client;
  } catch (error) {
    console.error('Error initializing Algolia client:', error);
    return null;
  }
}

// Transform attorney data for Algolia indexing (moved from client.ts to avoid liteClient issues)
function transformAttorneyForAlgolia(attorney: AttorneyWithDetails) {
  return {
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
    practice_categories: (attorney as any).practice_categories?.map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
    })) || [],
    // Make category names searchable as flat strings
    category_names: (attorney as any).practice_categories?.map((cat: any) => cat.name) || [],
    practice_areas: attorney.practice_areas.map(pa => ({
      name: pa.name,
      slug: pa.slug,
      category_id: (pa as any).category_id,
      category_name: (pa as any).category_name,
    })),
    // Make practice area names searchable as flat strings
    practice_area_names: attorney.practice_areas.map(pa => pa.name),
    average_rating: attorney.average_rating,
    review_count: attorney.review_count,
    // Google Reviews data
    google_rating: (attorney as any).google_rating || 0,
    google_review_count: (attorney as any).google_review_count || 0,
    // Include geocoding data if available
    latitude: attorney.latitude,
    longitude: attorney.longitude,
    formatted_address: attorney.formatted_address,
    _geoloc: attorney.latitude && attorney.longitude ? {
      lat: attorney.latitude,
      lng: attorney.longitude,
    } : undefined,
  };
}

// Index attorney data to Algolia
export async function indexAttorney(attorney: AttorneyWithDetails) {
  const client = await getAlgoliaClient();
  if (!client) {
    console.log('Algolia not configured, skipping indexing');
    return { success: true };
  }

  try {
    const transformedAttorney = transformAttorneyForAlgolia(attorney);
    console.log('Transformed attorney for Algolia:', JSON.stringify(transformedAttorney, null, 2));
    
    // In v5, use client.saveObjects with index name
    const result = await client.saveObjects({
      indexName: 'attorneys',
      objects: [transformedAttorney],
    });
    console.log('Algolia saveObjects result:', result);
    console.log('Successfully indexed attorney:', attorney.id);
    return { success: true };
  } catch (error) {
    console.error('Error indexing attorney:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error };
  }
}

// Remove attorney from Algolia index
export async function removeAttorneyFromIndex(attorneyId: string) {
  const client = await getAlgoliaClient();
  if (!client) {
    console.log('Algolia not configured, skipping removal');
    return { success: true };
  }

  try {
    await client.deleteObject({
      indexName: 'attorneys',
      objectID: attorneyId,
    });
    console.log('Successfully removed attorney from index:', attorneyId);
    return { success: true };
  } catch (error) {
    console.error('Error removing attorney from index:', error);
    return { success: false, error };
  }
}

// Batch index multiple attorneys
export async function batchIndexAttorneys(attorneys: AttorneyWithDetails[]) {
  const client = await getAlgoliaClient();
  if (!client) {
    console.log('Algolia not configured, skipping batch indexing');
    return { success: true };
  }

  try {
    const transformedAttorneys = attorneys.map(transformAttorneyForAlgolia);
    await client.saveObjects({
      indexName: 'attorneys',
      objects: transformedAttorneys,
    });
    console.log('Successfully batch indexed attorneys:', attorneys.length);
    return { success: true };
  } catch (error) {
    console.error('Error batch indexing attorneys:', error);
    return { success: false, error };
  }
}
