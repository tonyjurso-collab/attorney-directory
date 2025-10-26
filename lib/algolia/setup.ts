import { adminSearchClient } from './server';

export async function setupAlgoliaIndex() {
  if (!adminSearchClient) {
    console.log('Algolia not configured, skipping index setup');
    return { success: false, error: 'Algolia not configured' };
  }

  try {
    const index = adminSearchClient.initIndex('attorneys');

    // Configure the index settings
    await index.setSettings({
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

      // Geo search configuration
      geoSearch: {
        aroundLatLng: '35.2271, -80.8431', // Charlotte, NC coordinates
        aroundRadius: 50000, // 50km radius
      },

      // Search synonyms for better matching
      synonyms: [
        {
          objectID: 'drug-synonyms',
          type: 'synonym',
          synonyms: ['drug', 'drugs', 'drug crimes', 'drug possession', 'drug charges', 'drug offense']
        },
        {
          objectID: 'dui-synonyms', 
          type: 'synonym',
          synonyms: ['dui', 'dwi', 'driving under influence', 'drunk driving', 'dui defense']
        },
        {
          objectID: 'personal-injury-synonyms',
          type: 'synonym', 
          synonyms: ['personal injury', 'car accident', 'truck accident', 'motorcycle accident', 'slip and fall', 'workplace injury']
        },
        {
          objectID: 'family-law-synonyms',
          type: 'synonym',
          synonyms: ['family law', 'divorce', 'custody', 'child support', 'alimony', 'separation']
        },
        {
          objectID: 'criminal-defense-synonyms',
          type: 'synonym',
          synonyms: ['criminal defense', 'criminal charges', 'felony', 'misdemeanor', 'assault', 'theft', 'fraud']
        }
      ]
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
