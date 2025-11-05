async function getAlgoliaClient() {
  if (!process.env.ALGOLIA_ADMIN_API_KEY || !process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
    console.log('Missing Algolia environment variables');
    return null;
  }

  try {
    const { algoliasearch } = await import('algoliasearch');
    const client = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_API_KEY
    );
    return client;
  } catch (error) {
    console.error('Error initializing Algolia client:', error);
    return null;
  }
}

export async function setupAlgoliaIndex() {
  const client = await getAlgoliaClient();
  if (!client) {
    console.log('Algolia not configured, skipping index setup');
    return { success: false, error: 'Algolia not configured' };
  }

  try {
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
        'zip_code'
      ],

      // Attributes for faceting (filtering)
      attributesForFaceting: [
        'searchable(practice_areas.name)',
        'membership_tier',
        'is_verified',
        'city',
        'state'
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
      maxValuesPerFacet: 100,

      // Geo search configuration is handled in search queries, not settings
      // aroundLatLng and aroundRadius are query parameters, not settings

      // Note: Synonyms are managed separately in Algolia v5, not in indexSettings
      // Use the Algolia dashboard or API to manage synonyms separately
    }
    });

    console.log('Successfully configured Algolia index');
    return { success: true };
  } catch (error) {
    console.error('Error setting up Algolia index:', error);
    return { success: false, error };
  }
}

// Function to get coordinates for a location (you can integrate with a geocoding service)
export async function getCoordinatesForLocation(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  // For now, return Charlotte, NC coordinates as default
  // In production, you'd use a geocoding service like Google Maps API or OpenCage
  const defaultCoords = { lat: 35.2271, lng: -80.8431 };
  
  // Simple mapping for common cities (you can expand this)
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'charlotte': { lat: 35.2271, lng: -80.8431 },
    'raleigh': { lat: 35.7796, lng: -78.6382 },
    'greensboro': { lat: 36.0726, lng: -79.7920 },
    'durham': { lat: 35.9940, lng: -78.8986 },
    'winston-salem': { lat: 36.0999, lng: -80.2442 },
  };

  const cityKey = city.toLowerCase().replace(/\s+/g, '-');
  return cityCoordinates[cityKey] || defaultCoords;
}
