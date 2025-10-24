import { AttorneyWithDetails } from '@/lib/types/database';

// Algolia client will be initialized at runtime
export const searchClient = null;

// export const attorneysIndex = searchClient.initIndex('attorneys');

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
    _geoloc: attorney.city && attorney.state ? {
      lat: 0, // Will be populated with actual coordinates
      lng: 0, // Will be populated with actual coordinates
    } : undefined,
  };
}
