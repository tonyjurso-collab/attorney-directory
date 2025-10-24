export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export async function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to get city/state from coordinates using reverse geocoding
          const locationInfo = await reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            ...locationInfo
          });
        } catch (error) {
          // If reverse geocoding fails, just return coordinates
          resolve({
            latitude,
            longitude
          });
        }
      },
      (error) => {
        let message = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'The request to get user location timed out.';
            break;
        }
        
        reject({
          code: error.code,
          message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<UserLocation>> {
  try {
    // Using a free reverse geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    return {
      city: data.city,
      state: data.principalSubdivision,
      zipCode: data.postcode
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {};
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export function getRadiusOptions() {
  return [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' },
    { value: 0, label: 'Any distance' }
  ];
}