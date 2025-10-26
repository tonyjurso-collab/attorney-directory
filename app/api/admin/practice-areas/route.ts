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

    // Get all practice areas
    const { data: practiceAreas, error } = await supabase
      .from('practice_areas')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching practice areas:', error);
      return NextResponse.json({ error: 'Failed to fetch practice areas' }, { status: 500 });
    }

    return NextResponse.json(practiceAreas || []);
  } catch (error) {
    console.error('Error in GET /api/admin/practice-areas:', error);
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
    const { name, description, slug, is_active } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Create practice area
    const { data: practiceArea, error } = await supabase
      .from('practice_areas')
      .insert({
        name,
        description,
        slug,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating practice area:', error);
      return NextResponse.json({ error: 'Failed to create practice area' }, { status: 500 });
    }

    return NextResponse.json(practiceArea);
  } catch (error) {
    console.error('Error in POST /api/admin/practice-areas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
