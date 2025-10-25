import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// import { indexAttorney } from '@/lib/algolia/server';

export async function PUT(request: NextRequest) {
  console.log('PUT /api/attorney/profile called');
  
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to verify role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'attorney') {
      return NextResponse.json(
        { error: 'Unauthorized - Attorney access required' },
        { status: 403 }
      );
    }

    // Get the attorney record
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (attorneyError || !attorney) {
      return NextResponse.json(
        { error: 'Attorney profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Prepare update data (only include fields that are allowed)
    const updateData: any = {};
    
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.firm_name !== undefined) updateData.firm_name = body.firm_name;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.address_line1 !== undefined) updateData.address_line1 = body.address_line1;
    if (body.address_line2 !== undefined) updateData.address_line2 = body.address_line2;
    // Temporarily disable suite_number until database migration is applied
    // if (body.suite_number !== undefined) updateData.suite_number = body.suite_number;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zip_code !== undefined) updateData.zip_code = body.zip_code;
    if (body.experience_years !== undefined) updateData.experience_years = parseInt(body.experience_years) || 0;
    if (body.profile_image_url !== undefined) updateData.profile_image_url = body.profile_image_url;

    console.log('Updating attorney profile with data:', updateData);

    // Handle practice areas and categories if provided
    if (body.practice_areas !== undefined || body.categories !== undefined) {
      // First, delete existing practice areas
      const { error: deletePracticeAreasError } = await supabase
        .from('attorney_practice_areas')
        .delete()
        .eq('attorney_id', attorney.id);

      if (deletePracticeAreasError) {
        console.error('Error deleting existing practice areas:', deletePracticeAreasError);
        return NextResponse.json(
          { error: 'Failed to update practice areas', details: deletePracticeAreasError.message },
          { status: 500 }
        );
      }

      // Delete existing practice categories
      const { error: deleteCategoriesError } = await supabase
        .from('attorney_practice_categories')
        .delete()
        .eq('attorney_id', attorney.id);

      if (deleteCategoriesError) {
        console.error('Error deleting existing practice categories:', deleteCategoriesError);
        return NextResponse.json(
          { error: 'Failed to update practice categories', details: deleteCategoriesError.message },
          { status: 500 }
        );
      }

      // Insert new practice areas
      if (body.practice_areas && body.practice_areas.length > 0) {
        const practiceAreaInserts = body.practice_areas.map((practiceAreaId: string) => ({
          attorney_id: attorney.id,
          practice_area_id: practiceAreaId,
        }));

        const { error: insertPracticeAreasError } = await supabase
          .from('attorney_practice_areas')
          .insert(practiceAreaInserts);

        if (insertPracticeAreasError) {
          console.error('Error inserting practice areas:', insertPracticeAreasError);
          return NextResponse.json(
            { error: 'Failed to update practice areas', details: insertPracticeAreasError.message },
            { status: 500 }
          );
        }
      }

      // Insert new practice categories
      if (body.categories && body.categories.length > 0) {
        const categoryInserts = body.categories.map((categoryId: string) => ({
          attorney_id: attorney.id,
          category_id: categoryId,
        }));

        const { error: insertCategoriesError } = await supabase
          .from('attorney_practice_categories')
          .insert(categoryInserts);

        if (insertCategoriesError) {
          console.error('Error inserting practice categories:', insertCategoriesError);
          return NextResponse.json(
            { error: 'Failed to update practice categories', details: insertCategoriesError.message },
            { status: 500 }
          );
        }
      }
    }

    // Update the attorney record (include practice areas and categories for Algolia indexing)
    const { data: updatedAttorney, error: updateError } = await supabase
      .from('attorneys')
      .update(updateData)
      .eq('id', attorney.id)
      .select(`
        *,
        attorney_practice_categories (
          category_id,
          practice_area_categories (
            id,
            name,
            slug
          )
        ),
        attorney_practice_areas (
          practice_area_id,
          practice_areas (
            id,
            name,
            slug,
            description,
            category_id
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating attorney profile:', updateError);
      console.error('Update data that caused error:', updateData);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('Attorney profile updated successfully:', updatedAttorney);

    // Transform and reindex attorney in Algolia using dynamic import
    try {
      if (updatedAttorney) {
        console.log('Starting Algolia reindexing...');
        
        // Dynamic import to avoid module loading issues
        const { indexAttorney } = await import('@/lib/algolia/server');
        
               // Transform the attorney data to match AttorneyWithDetails format
               const transformedAttorney: any = {
                 ...updatedAttorney,
                 practice_categories: updatedAttorney.attorney_practice_categories?.map((apc: any) => ({
                   id: apc.practice_area_categories?.id,
                   name: apc.practice_area_categories?.name,
                   slug: apc.practice_area_categories?.slug,
                 })).filter((cat: any) => cat.id) || [],
                 practice_areas: updatedAttorney.attorney_practice_areas?.map((apa: any) => ({
                   id: apa.practice_areas?.id,
                   name: apa.practice_areas?.name,
                   slug: apa.practice_areas?.slug,
                   description: apa.practice_areas?.description,
                   category_id: apa.practice_areas?.category_id,
                 })).filter((pa: any) => pa.id) || [],
               };
        
        // Ensure all required fields are present
        if (!transformedAttorney.first_name) transformedAttorney.first_name = updatedAttorney.first_name;
        if (!transformedAttorney.last_name) transformedAttorney.last_name = updatedAttorney.last_name;

        console.log('Calling indexAttorney with attorney ID:', transformedAttorney.id);
        console.log('Transformed attorney data:', JSON.stringify(transformedAttorney, null, 2));
        const indexResult = await indexAttorney(transformedAttorney as any);
        console.log('Index result:', indexResult);
        
        if (!indexResult.success) {
          console.error('Failed to reindex attorney in Algolia:', indexResult.error);
          // Don't fail the entire request if Algolia indexing fails
        } else {
          console.log('Attorney reindexed in Algolia successfully');
        }
      }
    } catch (algoliaError: any) {
      console.error('Error in Algolia indexing:', algoliaError);
      console.error('Algolia error stack:', algoliaError?.stack);
      console.error('Algolia error details:', {
        message: algoliaError?.message,
        name: algoliaError?.name,
      });
      // Continue even if Algolia indexing fails
    }

    return NextResponse.json({
      success: true,
      attorney: updatedAttorney,
    });

  } catch (error: any) {
    console.error('Error in profile update API:', error);
    console.error('Error stack:', error.stack);
    
    // Make sure we return JSON even on error
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
