import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('practice_area_categories')
      .select('id, name, slug, lp_campaign_id, lp_supplier_id, lp_key, lp_config')
      .order('name');

    if (error) {
      console.error('Error fetching practice areas:', error);
      return NextResponse.json({ error: 'Failed to fetch practice areas' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in practice-areas API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
