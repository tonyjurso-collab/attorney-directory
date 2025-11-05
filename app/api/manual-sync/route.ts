import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting manual sync...');
    
    const supabase = await createClient();
    
    // Get all active attorneys
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching attorneys:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys', details: error }, { status: 500 });
    }

    if (!attorneys || attorneys.length === 0) {
      return NextResponse.json({ message: 'No attorneys found to sync' }, { status: 200 });
    }

    console.log(`📊 Found ${attorneys.length} attorneys in Supabase`);

    // Simple transformation for manual sync
    const simpleAttorneys = attorneys.map((attorney: any) => ({
      objectID: attorney.id,
      name: `${attorney.first_name} ${attorney.last_name}`,
      firm_name: attorney.firm_name,
      city: attorney.city,
      state: attorney.state,
      zip_code: attorney.zip_code,
      membership_tier: attorney.membership_tier,
      is_verified: attorney.is_verified,
      latitude: attorney.latitude,
      longitude: attorney.longitude,
      formatted_address: attorney.formatted_address,
      _geoloc: attorney.latitude && attorney.longitude ? {
        lat: attorney.latitude,
        lng: attorney.longitude,
      } : undefined,
    }));

    console.log(`📤 Prepared ${simpleAttorneys.length} attorneys for sync`);

    return NextResponse.json({ 
      message: `Prepared ${simpleAttorneys.length} attorneys for sync`,
      count: simpleAttorneys.length,
      attorneys: simpleAttorneys.map((a: any) => ({ 
        id: a.objectID, 
        name: a.name, 
        city: a.city, 
        state: a.state,
        hasGeo: !!a._geoloc
      }))
    });
  } catch (error) {
    console.error('Error in manual sync route:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
