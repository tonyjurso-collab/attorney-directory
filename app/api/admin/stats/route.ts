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

    // Get stats from multiple tables
    const [
      { count: totalAttorneys },
      { count: activeAttorneys },
      { count: totalLeads },
      { count: newLeads },
      { count: totalPracticeAreas },
      { count: activePracticeAreas },
      { count: totalUsers },
      { count: adminUsers },
    ] = await Promise.all([
      supabase.from('attorneys').select('*', { count: 'exact', head: true }),
      supabase.from('attorneys').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('practice_areas').select('*', { count: 'exact', head: true }),
      supabase.from('practice_areas').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    ]);

    const stats = {
      totalAttorneys: totalAttorneys || 0,
      activeAttorneys: activeAttorneys || 0,
      totalLeads: totalLeads || 0,
      newLeads: newLeads || 0,
      totalPracticeAreas: totalPracticeAreas || 0,
      activePracticeAreas: activePracticeAreas || 0,
      totalUsers: totalUsers || 0,
      adminUsers: adminUsers || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
