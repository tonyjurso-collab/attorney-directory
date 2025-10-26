/**
 * Google Places API (New) client for fetching attorney reviews and ratings
 * Uses the new Places API v1 for better performance and features
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = 'https://places.googleapis.com/v1';

export interface GoogleReview {
  authorAttribution: {
    displayName: string;
    photoUri?: string;
  };
  rating: number;
  text: { text: string };
  relativePublishTimeDescription: string;
  publishTime: string;
}

export interface PlaceDetails {
  rating: number;
  userRatingCount: number;
  reviews: GoogleReview[];
}

export interface GooglePlacesError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Fetch place details including rating and reviews from Google Places API
 * @param placeId - Google Place ID (e.g., "ChIJ...")
 * @returns PlaceDetails object or null if error
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not configured');
    return null;
  }

  if (!placeId || !placeId.startsWith('ChIJ')) {
    console.error('Invalid Google Place ID format:', placeId);
    return null;
  }

  try {
    const response = await fetch(
      `${PLACES_API_BASE}/places/${placeId}?fields=rating,userRatingCount,reviews&key=${GOOGLE_PLACES_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
        },
      }
    );

    if (!response.ok) {
      const errorData: GooglePlacesError = await response.json();
      console.error('Google Places API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
      });
      return null;
    }

    const data: PlaceDetails = await response.json();
    
    // Validate response data
    if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5) {
      console.error('Invalid rating data from Google Places API:', data.rating);
      return null;
    }

    console.log(`✅ Successfully fetched Google Places data for ${placeId}:`, {
      rating: data.rating,
      reviewCount: data.userRatingCount,
      reviewsLength: data.reviews?.length || 0,
    });

    return data;
  } catch (error) {
    console.error('Error fetching place details from Google Places API:', error);
    return null;
  }
}

/**
 * Validate Google Place ID format
 * @param placeId - Place ID to validate
 * @returns boolean indicating if format is valid
 */
export function isValidPlaceId(placeId: string): boolean {
  return placeId && placeId.startsWith('ChIJ') && placeId.length > 20;
}

/**
 * Generate Google Maps URL for a place ID
 * @param placeId - Google Place ID
 * @returns Google Maps URL
 */
export function getGoogleMapsUrl(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}
