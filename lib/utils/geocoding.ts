/**
 * Google Maps Geocoding API utilities
 * Handles address-to-coordinates and coordinates-to-address conversion
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface GeocodingError {
  error: string;
  message: string;
}

/**
 * Geocode an address to get coordinates and location details
 * @param address - Address string (e.g., "Charlotte, NC", "28202", "123 Main St, Charlotte, NC")
 * @returns Promise<GeocodingResult | GeocodingError>
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | GeocodingError> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBvOkBwJcDdEfGhIjKlMnOpQrStUvWxYzA';
  
  if (!apiKey) {
    return {
      error: 'API_KEY_MISSING',
      message: 'Google Maps API key is not configured'
    };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        error: 'API_REQUEST_FAILED',
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return {
        error: data.status,
        message: data.error_message || `Geocoding failed with status: ${data.status}`
      };
    }
    
    if (!data.results || data.results.length === 0) {
      return {
        error: 'NO_RESULTS',
        message: 'No results found for the provided address'
      };
    }
    
    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    const addressComponents = result.address_components || [];
    let city = '';
    let state = '';
    let zipCode = '';
    let country = '';
    
    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.short_name;
      }
    }
    
    return {
      latitude: location.lat,
      longitude: location.lng,
      formatted_address: result.formatted_address,
      city,
      state,
      zip_code: zipCode,
      country
    };
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
}

/**
 * Reverse geocode coordinates to get address details
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<GeocodingResult | GeocodingError>
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | GeocodingError> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return {
      error: 'API_KEY_MISSING',
      message: 'Google Maps API key is not configured'
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        error: 'API_REQUEST_FAILED',
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return {
        error: data.status,
        message: data.error_message || `Reverse geocoding failed with status: ${data.status}`
      };
    }
    
    if (!data.results || data.results.length === 0) {
      return {
        error: 'NO_RESULTS',
        message: 'No results found for the provided coordinates'
      };
    }
    
    const result = data.results[0];
    
    // Extract address components
    const addressComponents = result.address_components || [];
    let city = '';
    let state = '';
    let zipCode = '';
    let country = '';
    
    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.short_name;
      }
    }
    
    return {
      latitude,
      longitude,
      formatted_address: result.formatted_address,
      city,
      state,
      zip_code: zipCode,
      country
    };
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
}

/**
 * Geocode multiple addresses in batch (useful for processing attorney data)
 * @param addresses - Array of address strings
 * @param delay - Delay between requests in milliseconds (default: 100ms)
 * @returns Promise<Array<GeocodingResult | GeocodingError>>
 */
export async function batchGeocodeAddresses(
  addresses: string[], 
  delay: number = 100
): Promise<Array<GeocodingResult | GeocodingError>> {
  const results: Array<GeocodingResult | GeocodingError> = [];
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const result = await geocodeAddress(address);
    results.push(result);
    
    // Add delay to respect API rate limits
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Validate if an address string looks like a valid address
 * @param address - Address string to validate
 * @returns boolean
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  const trimmed = address.trim();
  
  // Must be at least 3 characters
  if (trimmed.length < 3) {
    return false;
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false;
  }
  
  return true;
}

/**
 * Format address for geocoding (clean up common issues)
 * @param address - Raw address string
 * @returns Cleaned address string
 */
export function formatAddressForGeocoding(address: string): string {
  if (!address) return '';
  
  return address
    .trim()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove common prefixes that might confuse geocoding
    .replace(/^(near|around|close to)\s+/i, '')
    .trim();
}
