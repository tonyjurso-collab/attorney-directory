/**
 * Script to geocode existing attorneys and populate their coordinates
 * This script fetches all attorneys from the database, geocodes their addresses,
 * and updates the database with the coordinates.
 */

import { createClient } from '@/lib/supabase/server';
import { geocodeAddress, formatAddressForGeocoding } from '@/lib/utils/geocoding';

interface AttorneyToGeocode {
  id: string;
  first_name: string;
  last_name: string;
  firm_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  formatted_address: string | null;
}

/**
 * Build a complete address string from attorney data
 */
function buildAddressString(attorney: AttorneyToGeocode): string {
  const parts: string[] = [];
  
  // Add address line 1
  if (attorney.address_line1) {
    parts.push(attorney.address_line1);
  }
  
  // Add address line 2
  if (attorney.address_line2) {
    parts.push(attorney.address_line2);
  }
  
  // Add city
  if (attorney.city) {
    parts.push(attorney.city);
  }
  
  // Add state
  if (attorney.state) {
    parts.push(attorney.state);
  }
  
  // Add zip code
  if (attorney.zip_code) {
    parts.push(attorney.zip_code);
  }
  
  // Add country if not US
  if (attorney.country && attorney.country !== 'US') {
    parts.push(attorney.country);
  }
  
  return parts.join(', ');
}

/**
 * Geocode a single attorney
 */
async function geocodeAttorney(attorney: AttorneyToGeocode): Promise<{
  success: boolean;
  attorney: AttorneyToGeocode;
  error?: string;
}> {
  try {
    // Build address string
    const addressString = buildAddressString(attorney);
    
    if (!addressString.trim()) {
      return {
        success: false,
        attorney,
        error: 'No address information available'
      };
    }
    
    // Format address for geocoding
    const formattedAddress = formatAddressForGeocoding(addressString);
    
    console.log(`Geocoding attorney ${attorney.first_name} ${attorney.last_name}: ${formattedAddress}`);
    
    // Geocode the address
    const geocodingResult = await geocodeAddress(formattedAddress);
    
    if ('error' in geocodingResult) {
      return {
        success: false,
        attorney,
        error: geocodingResult.message
      };
    }
    
    // Update attorney with geocoding results
    const updatedAttorney: AttorneyToGeocode = {
      ...attorney,
      latitude: geocodingResult.latitude,
      longitude: geocodingResult.longitude,
      formatted_address: geocodingResult.formatted_address
    };
    
    return {
      success: true,
      attorney: updatedAttorney
    };
    
  } catch (error) {
    console.error(`Error geocoding attorney ${attorney.id}:`, error);
    return {
      success: false,
      attorney,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update attorney in database with geocoding results
 */
async function updateAttorneyInDatabase(attorney: AttorneyToGeocode): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('attorneys')
      .update({
        latitude: attorney.latitude,
        longitude: attorney.longitude,
        formatted_address: attorney.formatted_address,
        updated_at: new Date().toISOString()
      })
      .eq('id', attorney.id);
    
    if (error) {
      console.error(`Error updating attorney ${attorney.id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating attorney ${attorney.id}:`, error);
    return false;
  }
}

/**
 * Main function to geocode all attorneys
 */
export async function geocodeAllAttorneys(): Promise<{
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ attorney: AttorneyToGeocode; error: string }>;
}> {
  console.log('Starting attorney geocoding process...');
  
  try {
    const supabase = await createClient();
    
    // Fetch all attorneys that don't have coordinates yet
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select(`
        id,
        first_name,
        last_name,
        firm_name,
        address_line1,
        address_line2,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        formatted_address
      `)
      .is('latitude', null)
      .is('longitude', null)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching attorneys:', error);
      throw error;
    }
    
    if (!attorneys || attorneys.length === 0) {
      console.log('No attorneys found that need geocoding.');
      return {
        total: 0,
        successful: 0,
        failed: 0,
        errors: []
      };
    }
    
    console.log(`Found ${attorneys.length} attorneys to geocode.`);
    
    const results = {
      total: attorneys.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ attorney: AttorneyToGeocode; error: string }>
    };
    
    // Process each attorney
    for (let i = 0; i < attorneys.length; i++) {
      const attorney = attorneys[i] as AttorneyToGeocode;
      
      console.log(`Processing attorney ${i + 1}/${attorneys.length}: ${attorney.first_name} ${attorney.last_name}`);
      
      // Geocode the attorney
      const geocodingResult = await geocodeAttorney(attorney);
      
      if (geocodingResult.success) {
        // Update the database
        const updateSuccess = await updateAttorneyInDatabase(geocodingResult.attorney);
        
        if (updateSuccess) {
          results.successful++;
          console.log(`✅ Successfully geocoded and updated ${attorney.first_name} ${attorney.last_name}`);
        } else {
          results.failed++;
          results.errors.push({
            attorney,
            error: 'Failed to update database'
          });
          console.log(`❌ Failed to update database for ${attorney.first_name} ${attorney.last_name}`);
        }
      } else {
        results.failed++;
        results.errors.push({
          attorney,
          error: geocodingResult.error || 'Unknown geocoding error'
        });
        console.log(`❌ Failed to geocode ${attorney.first_name} ${attorney.last_name}: ${geocodingResult.error}`);
      }
      
      // Add a small delay to respect API rate limits
      if (i < attorneys.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
      }
    }
    
    console.log('\n=== Geocoding Summary ===');
    console.log(`Total attorneys: ${results.total}`);
    console.log(`Successfully geocoded: ${results.successful}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n=== Errors ===');
      results.errors.forEach(({ attorney, error }) => {
        console.log(`${attorney.first_name} ${attorney.last_name}: ${error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('Fatal error in geocoding process:', error);
    throw error;
  }
}

/**
 * Geocode a single attorney by ID
 */
export async function geocodeSingleAttorney(attorneyId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Fetch the attorney
    const { data: attorney, error: fetchError } = await supabase
      .from('attorneys')
      .select(`
        id,
        first_name,
        last_name,
        firm_name,
        address_line1,
        address_line2,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        formatted_address
      `)
      .eq('id', attorneyId)
      .single();
    
    if (fetchError) {
      return {
        success: false,
        error: `Failed to fetch attorney: ${fetchError.message}`
      };
    }
    
    if (!attorney) {
      return {
        success: false,
        error: 'Attorney not found'
      };
    }
    
    // Geocode the attorney
    const geocodingResult = await geocodeAttorney(attorney as AttorneyToGeocode);
    
    if (!geocodingResult.success) {
      return {
        success: false,
        error: geocodingResult.error
      };
    }
    
    // Update the database
    const updateSuccess = await updateAttorneyInDatabase(geocodingResult.attorney);
    
    if (!updateSuccess) {
      return {
        success: false,
        error: 'Failed to update database'
      };
    }
    
    return {
      success: true
    };
    
  } catch (error) {
    console.error('Error geocoding single attorney:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
