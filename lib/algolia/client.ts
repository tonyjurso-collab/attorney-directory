import { liteClient } from 'algoliasearch/lite';
import { AttorneyWithDetails } from '@/lib/types/database';

// Lazy initialization - only create client when actually needed
let _searchClient: ReturnType<typeof liteClient> | null = null;

export function getSearchClient() {
  if (_searchClient) return _searchClient;
  
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
  
  if (!appId || !searchKey) {
    console.error('Algolia credentials not found:', { 
      appId: appId ? 'SET' : 'MISSING', 
      searchKey: searchKey ? 'SET' : 'MISSING' 
    });
    return null;
  }
  
  _searchClient = liteClient(appId, searchKey);
  return _searchClient;
}

export const searchClient = getSearchClient();
// Note: liteClient doesn't have initIndex method, we'll use search directly

// Transform attorney data for Algolia indexing
export function transformAttorneyForAlgolia(attorney: AttorneyWithDetails) {
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
    practice_areas: attorney.practice_areas.map(pa => ({
      name: pa.name,
      slug: pa.slug,
      is_primary: pa.is_primary,
    })),
    average_rating: attorney.average_rating,
    review_count: attorney.review_count,
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
