import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncAttorneyReviews } from '@/lib/google-places/sync';

/**
 * API route for syncing Google reviews
 * Can be called manually or by cron jobs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attorneyId, placeId } = body;
    
    if (!attorneyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Attorney ID is required' 
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get attorney data
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .select('id, full_name, google_place_id')
      .eq('id', attorneyId)
      .single();

    if (attorneyError || !attorney) {
      return NextResponse.json({ 
        success: false, 
        error: 'Attorney not found' 
      }, { status: 404 });
    }

    // Use provided placeId or attorney's stored placeId
    const targetPlaceId = placeId || attorney.google_place_id;
    
    if (!targetPlaceId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No Google Place ID configured for this attorney' 
      }, { status: 400 });
    }

    console.log(`🔄 Starting review sync for ${attorney.full_name} (${attorneyId})`);

    const result = await syncAttorneyReviews(attorneyId, targetPlaceId);
    
    if (result.success) {
      console.log(`✅ Review sync completed for ${attorney.full_name}:`, {
        reviewsCount: result.reviewsCount,
        rating: result.rating,
        reviewCount: result.reviewCount,
      });

      return NextResponse.json({ 
        success: true,
        message: 'Reviews synced successfully',
        data: {
          reviewsCount: result.reviewsCount,
          rating: result.rating,
          reviewCount: result.reviewCount,
        }
      });
    } else {
      console.error(`❌ Review sync failed for ${attorney.full_name}:`, result.error);
      
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to sync reviews' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sync-google-reviews API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check sync status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attorneyId = searchParams.get('attorneyId');
    
    if (!attorneyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Attorney ID is required' 
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: attorney, error } = await supabase
      .from('attorneys')
      .select('id, full_name, google_place_id, google_rating, google_review_count, google_reviews_last_synced')
      .eq('id', attorneyId)
      .single();

    if (error || !attorney) {
      return NextResponse.json({ 
        success: false, 
        error: 'Attorney not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        attorneyId: attorney.id,
        fullName: attorney.full_name,
        hasPlaceId: !!attorney.google_place_id,
        rating: attorney.google_rating,
        reviewCount: attorney.google_review_count,
        lastSynced: attorney.google_reviews_last_synced,
      }
    });
  } catch (error) {
    console.error('Error in sync-google-reviews GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
