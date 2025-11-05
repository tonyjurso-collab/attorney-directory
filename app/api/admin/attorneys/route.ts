import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all attorneys with related data
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select(`
        *,
        attorney_practice_areas (
          practice_area_id,
          is_primary,
          practice_areas (
            id,
            name,
            slug
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attorneys:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedAttorneys = attorneys?.map(attorney => ({
      ...attorney,
      practice_areas: attorney.attorney_practice_areas?.map((apa: any) => ({
        id: apa.practice_areas?.id,
        name: apa.practice_areas?.name,
        slug: apa.practice_areas?.slug,
        is_primary: apa.is_primary,
      })).filter((pa: { id?: string | number }) => pa.id) || [],
    })) || [];

    return NextResponse.json(transformedAttorneys);
  } catch (error) {
    console.error('Error in GET /api/admin/attorneys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      first_name,
      last_name,
      firm_name,
      bio,
      experience_years,
      phone,
      email,
      website,
      address_line1,
      city,
      state,
      zip_code,
      membership_tier,
      is_verified,
    } = body;

    // Create attorney record
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .insert({
        user_id: user.id, // This should be the actual user_id, not the admin's ID
        first_name,
        last_name,
        firm_name,
        bio,
        experience_years,
        phone,
        email,
        website,
        address_line1,
        city,
        state,
        zip_code,
        membership_tier: membership_tier || 'free',
        is_verified: is_verified || false,
      })
      .select()
      .single();

    if (attorneyError) {
      console.error('Error creating attorney:', attorneyError);
      return NextResponse.json({ error: 'Failed to create attorney' }, { status: 500 });
    }

    return NextResponse.json(attorney);
  } catch (error) {
    console.error('Error in POST /api/admin/attorneys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
