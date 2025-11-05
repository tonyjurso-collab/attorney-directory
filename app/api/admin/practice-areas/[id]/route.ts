import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: practiceArea, error } = await supabase
      .from('practice_areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching practice area:', error);
      return NextResponse.json({ error: 'Practice area not found' }, { status: 404 });
    }

    return NextResponse.json(practiceArea);
  } catch (error) {
    console.error('Error in GET /api/admin/practice-areas/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { created_at, ...updateData } = body;

    // Update practice area
    const { data: practiceArea, error } = await supabase
      .from('practice_areas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating practice area:', error);
      return NextResponse.json({ error: 'Failed to update practice area' }, { status: 500 });
    }

    return NextResponse.json(practiceArea);
  } catch (error) {
    console.error('Error in PUT /api/admin/practice-areas/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if practice area is being used by attorneys
    const { data: attorneyPracticeAreas } = await supabase
      .from('attorney_practice_areas')
      .select('id')
      .eq('practice_area_id', id)
      .limit(1);

    if (attorneyPracticeAreas && attorneyPracticeAreas.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete practice area that is assigned to attorneys' 
      }, { status: 400 });
    }

    // Delete practice area
    const { error } = await supabase
      .from('practice_areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting practice area:', error);
      return NextResponse.json({ error: 'Failed to delete practice area' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/practice-areas/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
