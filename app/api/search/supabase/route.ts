import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, practice_area, tier, location, radius } = body;
    
    const supabase = await createClient();
    
    // Build the base query
    let supabaseQuery = supabase
      .from('attorneys')
      .select(`
        *,
        attorney_practice_areas (
          practice_area_id,
          is_primary,
          practice_areas (
            id,
            name,
            slug,
            description
          )
        )
      `)
      .eq('is_active', true);

    // Add text search if query is provided
    if (query && query.trim()) {
      supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,firm_name.ilike.%${query}%`);
    }

    // Add practice area filter
    if (practice_area) {
      supabaseQuery = supabaseQuery.eq('attorney_practice_areas.practice_areas.name', practice_area);
    }

    // Add tier filter
    if (tier) {
      supabaseQuery = supabaseQuery.eq('membership_tier', tier);
    }

    const { data: attorneys, error } = await supabaseQuery;

    if (error) {
      console.error('Error fetching attorneys from Supabase:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys' }, { status: 500 });
    }

    if (!attorneys || attorneys.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Transform the data to match component expectations
    const transformedAttorneys = attorneys.map((attorney: any) => ({
      ...attorney,
      practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
        id: apa.practice_areas?.id,
        name: apa.practice_areas?.name,
        slug: apa.practice_areas?.slug,
        description: apa.practice_areas?.description,
        is_primary: apa.is_primary,
      })).filter((pa: { id?: string | number }) => pa.id) || [],
    }));

    // Apply geo filtering if location and radius are provided
    let filteredResults = transformedAttorneys;
    
    if (location && radius && radius > 0) {
      console.log('🌍 Applying geo filtering:', {
        location: location,
        radius: radius,
        totalAttorneys: transformedAttorneys.length
      });
      
      filteredResults = transformedAttorneys.filter((attorney: any) => {
        if (!attorney.latitude || !attorney.longitude) {
          console.log(`❌ Attorney ${attorney.first_name} ${attorney.last_name} has no coordinates`);
          return false;
        }
        
        // Calculate distance using Haversine formula
        const R = 3959; // Earth's radius in miles
        const dLat = (location.latitude - attorney.latitude) * Math.PI / 180;
        const dLon = (location.longitude - attorney.longitude) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(attorney.latitude * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        console.log(`📍 Attorney ${attorney.first_name} ${attorney.last_name}: distance ${distance.toFixed(2)} miles (limit: ${radius})`);
        return distance <= radius;
      });
      
      console.log(`✅ Geo filtering complete: ${filteredResults.length} attorneys within ${radius} miles`);
    }

    // Transform for display
    const results = filteredResults.map((attorney: any) => ({
      objectID: attorney.id,
      name: `${attorney.first_name} ${attorney.last_name}`,
      first_name: attorney.first_name,  // Add individual fields for AttorneyCard
      last_name: attorney.last_name,    // Add individual fields for AttorneyCard
      firm_name: attorney.firm_name,
      bio: attorney.bio,
      experience_years: attorney.experience_years,
      phone: attorney.phone,
      email: attorney.email,
      website: attorney.website,
      city: attorney.city,
      state: attorney.state,
      zip_code: attorney.zip_code,
      membership_tier: attorney.membership_tier,
      is_verified: attorney.is_verified,
      practice_areas: attorney.practice_areas.map((pa: any) => ({
        name: pa.name,
        slug: pa.slug,
        is_primary: pa.is_primary,
      })),
      average_rating: attorney.average_rating,
      review_count: attorney.review_count,
      latitude: attorney.latitude,
      longitude: attorney.longitude,
      formatted_address: attorney.formatted_address,
      _geoloc: attorney.latitude && attorney.longitude ? {
        lat: attorney.latitude,
        lng: attorney.longitude,
      } : undefined,
    }));

    return NextResponse.json({ 
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in Supabase search route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
