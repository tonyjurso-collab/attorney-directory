import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practiceArea = searchParams.get('practice_area');
    const state = searchParams.get('state');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const city = searchParams.get('city');
    const zipCode = searchParams.get('zip_code');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Supabase not configured, returning mock data');
      
      // Return mock attorney data for testing
      const mockAttorneys = [
        {
          id: 'mock-1',
          full_name: 'John Smith',
          email: 'john.smith@lawfirm.com',
          phone: '(555) 123-4567',
          bio: 'Experienced personal injury attorney with over 15 years of practice.',
          years_experience: 15,
          law_school: 'Harvard Law School',
          bar_admissions: ['NJ', 'NY'],
          practice_areas: [
            { id: '1', name: 'Personal Injury', slug: 'personal-injury', is_primary: true },
            { id: '2', name: 'Car Accident', slug: 'car-accident', is_primary: false }
          ],
          location: {
            city: 'Newark',
            state: 'NJ',
            zip_code: '07102'
          },
          rating: 4.8,
          review_count: 127,
          profile_image_url: null,
          membership_tier: 'exclusive'
        },
        {
          id: 'mock-2',
          full_name: 'Sarah Johnson',
          email: 'sarah.johnson@lawfirm.com',
          phone: '(555) 234-5678',
          bio: 'Dedicated family law attorney helping clients navigate complex legal matters.',
          years_experience: 12,
          law_school: 'Yale Law School',
          bar_admissions: ['NJ', 'PA'],
          practice_areas: [
            { id: '3', name: 'Family Law', slug: 'family-law', is_primary: true },
            { id: '4', name: 'Divorce', slug: 'divorce', is_primary: false }
          ],
          location: {
            city: 'Jersey City',
            state: 'NJ',
            zip_code: '07302'
          },
          rating: 4.9,
          review_count: 89,
          profile_image_url: null,
          membership_tier: 'exclusive'
        },
        {
          id: 'mock-3',
          full_name: 'Michael Brown',
          email: 'michael.brown@lawfirm.com',
          phone: '(555) 345-6789',
          bio: 'Criminal defense attorney with a track record of successful case outcomes.',
          years_experience: 18,
          law_school: 'Columbia Law School',
          bar_admissions: ['NJ', 'NY'],
          practice_areas: [
            { id: '5', name: 'Criminal Defense', slug: 'criminal-defense', is_primary: true },
            { id: '6', name: 'DUI Defense', slug: 'dui-defense', is_primary: false }
          ],
          location: {
            city: 'Paterson',
            state: 'NJ',
            zip_code: '07501'
          },
          rating: 4.7,
          review_count: 156,
          profile_image_url: null,
          membership_tier: 'standard'
        }
      ];

      // Filter mock data based on search parameters
      let filteredAttorneys = mockAttorneys;

      if (state) {
        filteredAttorneys = filteredAttorneys.filter(attorney => 
          attorney.location.state === state.toUpperCase()
        );
      }

      if (practiceArea) {
        const searchTerm = practiceArea.toLowerCase();
        filteredAttorneys = filteredAttorneys.filter(attorney => 
          attorney.practice_areas.some(pa => 
            pa.name.toLowerCase().includes(searchTerm) ||
            pa.slug.toLowerCase().includes(searchTerm)
          )
        );
      }

      if (category) {
        const searchTerm = category.toLowerCase();
        filteredAttorneys = filteredAttorneys.filter(attorney => 
          attorney.practice_areas.some(pa => 
            pa.name.toLowerCase().includes(searchTerm) ||
            pa.slug.toLowerCase().includes(searchTerm)
          )
        );
      }

      return NextResponse.json({ 
        attorneys: filteredAttorneys,
        total: filteredAttorneys.length,
        message: 'Mock data - Supabase not configured',
        filters: {
          practice_area: practiceArea,
          state,
          category,
          subcategory,
          city,
          zip_code: zipCode
        }
      });
    }

    const supabase = await createClient();
    
    // Check if Supabase is properly configured
    if (!supabase || typeof supabase.from !== 'function') {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Build the query
    let query = supabase
      .from('attorneys')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        bio,
        years_experience,
        law_school,
        bar_admissions,
        city,
        state,
        zip_code,
        profile_image_url,
        membership_tier,
        is_active,
        attorney_practice_areas (
          practice_area_id,
          is_primary,
          practice_areas (
            id,
            name,
            slug,
            description,
            category_id,
            practice_area_categories (
              id,
              name,
              slug
            )
          )
        )
      `)
      .eq('is_active', true);

    // Add filters based on search parameters
    if (state) {
      query = query.eq('state', state.toUpperCase());
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (zipCode) {
      query = query.eq('zip_code', zipCode);
    }

    // Filter by practice area if specified
    if (practiceArea || category || subcategory) {
      // We'll need to join with practice areas to filter
      // For now, we'll get all attorneys and filter in memory
      // This could be optimized with a proper join query
    }

    // Order by membership tier and rating
    query = query.order('membership_tier', { ascending: false })
                 .order('years_experience', { ascending: false })
                 .limit(limit);

    const { data: attorneys, error } = await query;

    if (error) {
      console.error('Error fetching attorneys:', error);
      return NextResponse.json({ error: 'Failed to fetch attorneys' }, { status: 500 });
    }

    if (!attorneys || attorneys.length === 0) {
      return NextResponse.json({ 
        attorneys: [],
        total: 0,
        message: 'No attorneys found matching your criteria'
      });
    }

    // Transform the data to match our component expectations
    const transformedAttorneys = attorneys.map((attorney: any) => {
      const practiceAreas = attorney.attorney_practice_areas?.map((apa: any) => ({
        id: apa.practice_areas?.id,
        name: apa.practice_areas?.name,
        slug: apa.practice_areas?.slug,
        description: apa.practice_areas?.description,
        is_primary: apa.is_primary,
        category: apa.practice_areas?.practice_area_categories?.name
      })).filter(pa => pa.id) || [];

      return {
        id: attorney.id,
        full_name: `${attorney.first_name} ${attorney.last_name}`,
        email: attorney.email,
        phone: attorney.phone,
        bio: attorney.bio,
        years_experience: attorney.years_experience,
        law_school: attorney.law_school,
        bar_admissions: attorney.bar_admissions || [],
        practice_areas: practiceAreas,
        location: {
          city: attorney.city,
          state: attorney.state,
          zip_code: attorney.zip_code
        },
        rating: 4.5, // Default rating - this should come from reviews table
        review_count: 0, // Default review count - this should come from reviews table
        profile_image_url: attorney.profile_image_url,
        membership_tier: attorney.membership_tier
      };
    });

    // Filter by practice area if specified (client-side filtering for now)
    let filteredAttorneys = transformedAttorneys;

    if (practiceArea) {
      const searchTerm = practiceArea.toLowerCase();
      filteredAttorneys = filteredAttorneys.filter(attorney => 
        attorney.practice_areas.some(pa => 
          pa.name.toLowerCase().includes(searchTerm) ||
          pa.slug.toLowerCase().includes(searchTerm)
        )
      );
    }

    if (category) {
      const searchTerm = category.toLowerCase();
      filteredAttorneys = filteredAttorneys.filter(attorney => 
        attorney.practice_areas.some(pa => 
          pa.category?.toLowerCase().includes(searchTerm)
        )
      );
    }

    if (subcategory) {
      const searchTerm = subcategory.toLowerCase();
      filteredAttorneys = filteredAttorneys.filter(attorney => 
        attorney.practice_areas.some(pa => 
          pa.name.toLowerCase().includes(searchTerm) ||
          pa.slug.toLowerCase().includes(searchTerm)
        )
      );
    }

    return NextResponse.json({
      attorneys: filteredAttorneys,
      total: filteredAttorneys.length,
      filters: {
        practice_area: practiceArea,
        state,
        category,
        subcategory,
        city,
        zip_code: zipCode
      }
    });

  } catch (error) {
    console.error('Error in search-attorneys API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
