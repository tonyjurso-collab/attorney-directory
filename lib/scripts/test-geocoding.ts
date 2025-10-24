/**
 * Test script for geocoding functionality
 * This script tests the geocoding utilities to ensure they work correctly
 */

import { geocodeAddress, reverseGeocode, formatAddressForGeocoding } from '@/lib/utils/geocoding';

/**
 * Test geocoding with various address formats
 */
async function testGeocoding() {
  console.log('🧪 Testing Geocoding Functionality...\n');
  
  const testAddresses = [
    'Charlotte, NC',
    'Indian Trail, NC',
    '28202', // Charlotte zip code
    '123 Main St, Charlotte, NC 28202',
    'New York, NY',
    'Los Angeles, CA',
  ];
  
  for (const address of testAddresses) {
    console.log(`📍 Testing: "${address}"`);
    
    try {
      const result = await geocodeAddress(address);
      
      if ('error' in result) {
        console.log(`❌ Error: ${result.error} - ${result.message}`);
      } else {
        console.log(`✅ Success:`);
        console.log(`   Formatted: ${result.formatted_address}`);
        console.log(`   Coordinates: ${result.latitude}, ${result.longitude}`);
        console.log(`   City: ${result.city || 'N/A'}`);
        console.log(`   State: ${result.state || 'N/A'}`);
        console.log(`   Zip: ${result.zip_code || 'N/A'}`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

/**
 * Test reverse geocoding with coordinates
 */
async function testReverseGeocoding() {
  console.log('🔄 Testing Reverse Geocoding...\n');
  
  const testCoordinates = [
    { lat: 35.2271, lng: -80.8431 }, // Charlotte, NC
    { lat: 35.0767, lng: -80.6684 }, // Indian Trail, NC
    { lat: 40.7128, lng: -74.0060 }, // New York, NY
  ];
  
  for (const coord of testCoordinates) {
    console.log(`📍 Testing coordinates: ${coord.lat}, ${coord.lng}`);
    
    try {
      const result = await reverseGeocode(coord.lat, coord.lng);
      
      if ('error' in result) {
        console.log(`❌ Error: ${result.error} - ${result.message}`);
      } else {
        console.log(`✅ Success:`);
        console.log(`   Formatted: ${result.formatted_address}`);
        console.log(`   City: ${result.city || 'N/A'}`);
        console.log(`   State: ${result.state || 'N/A'}`);
        console.log(`   Zip: ${result.zip_code || 'N/A'}`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

/**
 * Test address formatting
 */
function testAddressFormatting() {
  console.log('🔧 Testing Address Formatting...\n');
  
  const testAddresses = [
    'Charlotte, NC',
    'near Charlotte, NC',
    '  123 Main St, Charlotte, NC   ',
    'close to Indian Trail, NC',
    'around 28202',
  ];
  
  for (const address of testAddresses) {
    const formatted = formatAddressForGeocoding(address);
    console.log(`"${address}" → "${formatted}"`);
  }
  
  console.log('');
}

/**
 * Main test function
 */
export async function runGeocodingTests() {
  console.log('🚀 Starting Geocoding Tests\n');
  console.log('=' .repeat(50));
  
  // Check if Google Maps API key is configured
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log('❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured');
    console.log('Please add your Google Maps API key to .env.local');
    return;
  }
  
  console.log('✅ Google Maps API key is configured');
  console.log('');
  
  // Run tests
  await testGeocoding();
  await testReverseGeocoding();
  testAddressFormatting();
  
  console.log('=' .repeat(50));
  console.log('✅ Geocoding tests completed!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runGeocodingTests().catch(console.error);
}
