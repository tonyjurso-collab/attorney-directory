import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode } from '@/lib/utils/geocoding';

/**
 * API route to test geocoding functionality
 * GET /api/test-geocoding?address=Charlotte,NC
 * GET /api/test-geocoding?lat=35.2271&lng=-80.8431
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    // Check if Google Maps API key is configured
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'Google Maps API key not configured',
        message: 'Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file'
      }, { status: 500 });
    }
    
    if (address) {
      // Test forward geocoding
      console.log(`Testing geocoding for address: ${address}`);
      
      const result = await geocodeAddress(address);
      
      return NextResponse.json({
        type: 'forward_geocoding',
        input: address,
        result
      });
    } else if (lat && lng) {
      // Test reverse geocoding
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({
          error: 'Invalid coordinates',
          message: 'lat and lng must be valid numbers'
        }, { status: 400 });
      }
      
      console.log(`Testing reverse geocoding for coordinates: ${latitude}, ${longitude}`);
      
      const result = await reverseGeocode(latitude, longitude);
      
      return NextResponse.json({
        type: 'reverse_geocoding',
        input: { latitude, longitude },
        result
      });
    } else {
      return NextResponse.json({
        error: 'Missing parameters',
        message: 'Please provide either "address" or "lat" and "lng" parameters',
        examples: {
          forward_geocoding: '/api/test-geocoding?address=Charlotte,NC',
          reverse_geocoding: '/api/test-geocoding?lat=35.2271&lng=-80.8431'
        }
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in geocoding test API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
