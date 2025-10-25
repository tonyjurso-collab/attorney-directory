// IP-based geolocation utilities
export interface IPLocationResult {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  success: boolean;
  error?: string;
}

// Free IP geolocation service (no API key required)
export async function getLocationFromIP(): Promise<IPLocationResult> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'IP geolocation failed');
    }
    
    return {
      city: data.city || '',
      state: data.region || '',
      country: data.country_name || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      formatted_address: `${data.city || ''}, ${data.region || ''}`.trim().replace(/,$/, ''),
      success: true
    };
    
  } catch (error: any) {
    console.error('IP geolocation error:', error);
    return {
      city: '',
      state: '',
      country: '',
      latitude: 0,
      longitude: 0,
      formatted_address: '',
      success: false,
      error: error.message
    };
  }
}

// Alternative IP geolocation service (backup)
export async function getLocationFromIPBackup(): Promise<IPLocationResult> {
  try {
    const response = await fetch('https://ipinfo.io/json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Parse the loc field (format: "lat,lng")
    const [latitude, longitude] = data.loc ? data.loc.split(',').map(Number) : [0, 0];
    
    return {
      city: data.city || '',
      state: data.region || '',
      country: data.country || '',
      latitude,
      longitude,
      formatted_address: `${data.city || ''}, ${data.region || ''}`.trim().replace(/,$/, ''),
      success: true
    };
    
  } catch (error: any) {
    console.error('IP geolocation backup error:', error);
    return {
      city: '',
      state: '',
      country: '',
      latitude: 0,
      longitude: 0,
      formatted_address: '',
      success: false,
      error: error.message
    };
  }
}

// Main function that tries primary service, then backup
export async function detectUserLocation(): Promise<IPLocationResult> {
  console.log('🌍 Detecting user location from IP...');
  
  // Try primary service first
  const primaryResult = await getLocationFromIP();
  
  if (primaryResult.success) {
    console.log('✅ IP geolocation successful:', primaryResult.formatted_address);
    return primaryResult;
  }
  
  console.log('⚠️ Primary IP service failed, trying backup...');
  
  // Try backup service
  const backupResult = await getLocationFromIPBackup();
  
  if (backupResult.success) {
    console.log('✅ IP geolocation backup successful:', backupResult.formatted_address);
    return backupResult;
  }
  
  console.log('❌ Both IP geolocation services failed');
  return {
    city: '',
    state: '',
    country: '',
    latitude: 0,
    longitude: 0,
    formatted_address: '',
    success: false,
    error: 'All IP geolocation services failed'
  };
}
