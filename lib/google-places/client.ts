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

/**
 * Extract Google Place ID from various Google Maps URL formats
 * @param url - Google Maps URL
 * @returns Place ID string or null if not found
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Clean the URL
  const cleanUrl = url.trim();

  // Pattern 1: Direct place_id parameter
  // https://maps.google.com/?q=place_id:ChIJ...
  const placeIdPattern = /place_id:([A-Za-z0-9_-]+)/;
  const placeIdMatch = cleanUrl.match(placeIdPattern);
  if (placeIdMatch) {
    return placeIdMatch[1];
  }

  // Pattern 2: CID parameter (older format)
  // https://maps.google.com/?cid=1234567890
  const cidPattern = /[?&]cid=(\d+)/;
  const cidMatch = cleanUrl.match(cidPattern);
  if (cidMatch) {
    return cidMatch[1];
  }

  // Pattern 3: Maps place URL with encoded place ID
  // https://www.google.com/maps/place/Attorney+Name/@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3dlat!4dlng!16splace_id:ChIJ...
  const mapsPlacePattern = /\/maps\/place\/[^/]+\/[^/]+\/data=[^!]*!16splace_id:([A-Za-z0-9_-]+)/;
  const mapsPlaceMatch = cleanUrl.match(mapsPlacePattern);
  if (mapsPlaceMatch) {
    return mapsPlaceMatch[1];
  }

  // Pattern 4: Short URL format
  // https://goo.gl/maps/xyz or https://maps.app.goo.gl/xyz
  if (cleanUrl.includes('goo.gl/maps/') || cleanUrl.includes('maps.app.goo.gl/')) {
    // For short URLs, we'd need to resolve them first
    // This is a placeholder - in production you might want to resolve the short URL
    console.warn('Short URL detected - would need to resolve to extract Place ID:', cleanUrl);
    return null;
  }

  // Pattern 5: Search-based URL
  // https://www.google.com/maps/search/?api=1&query=Attorney+Name&query_place_id=ChIJ...
  const searchPlacePattern = /query_place_id=([A-Za-z0-9_-]+)/;
  const searchPlaceMatch = cleanUrl.match(searchPlacePattern);
  if (searchPlaceMatch) {
    return searchPlaceMatch[1];
  }

  return null;
}