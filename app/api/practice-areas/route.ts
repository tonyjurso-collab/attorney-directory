import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Fetch practice area categories with their practice areas
    const { data: categories, error } = await supabase
      .from('practice_area_categories')
      .select(`
        id,
        slug,
        name,
        description,
        display_order,
        practice_areas (
          id,
          slug,
          name,
          display_order
        )
      `)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching practice areas:', error);
      return NextResponse.json({ error: 'Failed to fetch practice areas' }, { status: 500 });
    }

    // Transform the data to match our component expectations
    const transformedCategories = categories?.map(category => ({
      ...category,
      practice_areas: category.practice_areas
        ?.filter(pa => pa) // Remove null entries
        .sort((a, b) => a.display_order - b.display_order) || []
    })) || [];

    return NextResponse.json({
      categories: transformedCategories,
      success: true
    });
  } catch (error) {
    console.error('Error in practice areas API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
