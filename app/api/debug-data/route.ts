import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get all attorneys from Supabase
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select(`
        id,
        first_name,
        last_name,
        firm_name,
        city,
        state,
        zip_code,
        latitude,
        longitude,
        formatted_address,
        is_active
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching attorneys:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Found ${attorneys?.length || 0} attorneys in Supabase`,
      attorneys: attorneys || [],
      count: attorneys?.length || 0
    });
  } catch (error) {
    console.error('Error in debug-data route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
