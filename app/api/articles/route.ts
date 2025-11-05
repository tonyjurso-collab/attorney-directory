import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ArticleFilters } from '@/lib/types/articles';

// GET list of articles with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query string
    const filters: ArticleFilters = {
      status: searchParams.get('status') as any || undefined,
      attorney_id: searchParams.get('attorney_id') || undefined,
      practice_area_id: searchParams.get('practice_area_id') || undefined,
      tag_id: searchParams.get('tag_id') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Check if user is admin for additional permissions
    const { data: { user } } = await supabase.auth.getUser();
    
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      isAdmin = profile?.role === 'admin';
    }

    // Build query
    let query = supabase
      .from('attorney_articles')
      .select(`
        *,
        attorney:attorneys!inner(
          id,
          first_name,
          last_name,
          firm_name,
          profile_image_url
        ),
        article_practice_areas(
          practice_area:practice_areas(
            id,
            name,
            slug,
            description
          )
        ),
        article_tag_associations(
          tag:article_tags(
            id,
            name,
            slug
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    } else if (!isAdmin) {
      // Non-admins only see published articles by default
      query = query.eq('status', 'published');
    }

    if (filters.attorney_id) {
      query = query.eq('attorney_id', filters.attorney_id);
    }

    if (filters.practice_area_id) {
      query = query.eq('article_practice_areas.practice_area_id', filters.practice_area_id);
    }

    if (filters.tag_id) {
      query = query.eq('article_tag_associations.tag_id', filters.tag_id);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Order by published_at or created_at
    if (filters.status === 'published') {
      query = query.order('published_at', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 20;
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      articles: articles || [],
      total: count || 0,
      limit: limit,
      offset: offset
    });

  } catch (error: any) {
    console.error('Error in GET /api/articles:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



