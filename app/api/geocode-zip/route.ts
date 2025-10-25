import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zip = searchParams.get('zip');

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 500 });
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract city and state from address components
      // Prioritize locality (city) over administrative_area_level_2 (county)
      let city = '';
      let state = '';
      
      for (const component of result.address_components) {
        // Get the actual city (locality) first
        if (component.types.includes('locality')) {
          city = component.short_name;
        }
        // Only use county if we don't have a city
        if (!city && component.types.includes('administrative_area_level_2')) {
          city = component.short_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      }

      if (city && state) {
        return NextResponse.json({ city, state, full_address: result.formatted_address });
      } else {
        return NextResponse.json({ error: 'Unable to determine location' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error geocoding zip:', error);
    return NextResponse.json({ error: 'Failed to geocode zip code' }, { status: 500 });
  }
}
