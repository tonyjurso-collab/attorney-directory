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
  return !!placeId && placeId.startsWith('ChIJ') && placeId.length > 20;
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
 * Get city and state from a zip code using Google Places API
 * @param zipCode - 5-digit US zip code
 * @returns Object with city and state or null if not found
 */
export async function getCityStateFromZipCode(zipCode: string): Promise<{ city: string; state: string } | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured, using mock data for testing');
    // Mock data for testing - remove this in production
    const mockData: Record<string, { city: string; state: string }> = {
      '28034': { city: 'Charlotte', state: 'NC' },
      '90210': { city: 'Beverly Hills', state: 'CA' },
      '10001': { city: 'New York', state: 'NY' },
      '60601': { city: 'Chicago', state: 'IL' },
      '33101': { city: 'Miami', state: 'FL' },
    };
    
    if (mockData[zipCode]) {
      console.log(`✅ Mock lookup for zip code ${zipCode}:`, mockData[zipCode]);
      return mockData[zipCode];
    }
    
    return null;
  }

  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    console.error('Invalid zip code format:', zipCode);
    return null;
  }

  try {
    // Use Google Places API Text Search to find location by zip code
    const response = await fetch(
      `${PLACES_API_BASE}/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.formattedAddress,places.addressComponents',
        },
        body: JSON.stringify({
          textQuery: zipCode,
          maxResultCount: 1,
          languageCode: 'en',
        }),
      }
    );

    if (!response.ok) {
      const errorData: GooglePlacesError = await response.json();
      console.error('Google Places API error for zip code lookup:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
      });
      return null;
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      console.warn(`No location found for zip code: ${zipCode}`);
      return null;
    }

    const place = data.places[0];
    const addressComponents = place.addressComponents || [];
    
    // Extract city and state from address components
    let city = '';
    let state = '';
    
    for (const component of addressComponents) {
      const types = component.types || [];
      
      if (types.includes('locality')) {
        city = component.longText || component.shortText || '';
      } else if (types.includes('administrative_area_level_1')) {
        state = component.shortText || component.longText || '';
      }
    }

    if (!city || !state) {
      console.warn(`Could not extract city/state from zip code ${zipCode}:`, {
        city,
        state,
        addressComponents,
      });
      return null;
    }

    console.log(`✅ Successfully resolved zip code ${zipCode} to:`, { city, state });

    return { city, state };
  } catch (error) {
    console.error('Error fetching city/state from zip code:', error);
    return null;
  }
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