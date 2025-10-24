import { LocationData } from '@/lib/types/database';

export async function getCurrentLocation(): Promise<LocationData | null> {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by this browser.');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address details
          const addressData = await reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            city: addressData.city,
            state: addressData.state,
            zip_code: addressData.zip_code,
          });
        } catch (error) {
          console.error('Error getting address from coordinates:', error);
          resolve({
            latitude,
            longitude,
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

async function reverseGeocode(lat: number, lng: number) {
  // Using a free reverse geocoding service
  // In production, you might want to use Google Maps API or another service
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  
  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }
  
  const data = await response.json();
  
  return {
    city: data.city,
    state: data.principalSubdivision,
    zip_code: data.postcode,
  };
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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
