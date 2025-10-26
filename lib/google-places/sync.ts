/**
 * Google Places review synchronization service
 * Handles caching of Google reviews in the database with fallbacks for test data
 */

import { createClient } from '@/lib/supabase/server';
import { getPlaceDetails, isValidPlaceId } from './client';

export interface SyncResult {
  success: boolean;
  error?: string;
  reviewsCount?: number;
  rating?: number;
  reviewCount?: number;
}

/**
 * Sync Google reviews for a specific attorney
 * @param attorneyId - Attorney UUID
 * @param placeId - Google Place ID
 * @returns SyncResult with success status and details
 */
export async function syncAttorneyReviews(attorneyId: string, placeId: string): Promise<SyncResult> {
  try {
    // Validate inputs
    if (!attorneyId || !placeId) {
      return { success: false, error: 'Missing attorney ID or place ID' };
    }

    if (!isValidPlaceId(placeId)) {
      return { success: false, error: 'Invalid Google Place ID format' };
    }

    const supabase = await createClient();
    
    // Verify attorney exists
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .select('id, full_name')
      .eq('id', attorneyId)
      .single();

    if (attorneyError || !attorney) {
      return { success: false, error: 'Attorney not found' };
    }

    console.log(`🔄 Syncing Google reviews for ${attorney.full_name} (${attorneyId})`);

    // Fetch from Google Places API
    const placeDetails = await getPlaceDetails(placeId);
    if (!placeDetails) {
      return { success: false, error: 'Failed to fetch data from Google Places API' };
    }

    // Update attorney rating summary
    const { error: updateError } = await supabase
      .from('attorneys')
      .update({
        google_rating: placeDetails.rating,
        google_review_count: placeDetails.userRatingCount,
        google_reviews_last_synced: new Date().toISOString(),
      })
      .eq('id', attorneyId);

    if (updateError) {
      console.error('Error updating attorney rating:', updateError);
      return { success: false, error: 'Failed to update attorney rating' };
    }

    // Delete old cached reviews
    const { error: deleteError } = await supabase
      .from('google_reviews')
      .delete()
      .eq('attorney_id', attorneyId);

    if (deleteError) {
      console.error('Error deleting old reviews:', deleteError);
      // Continue anyway - this is not critical
    }

    // Insert new reviews
    let reviewsCount = 0;
    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
      const reviewsToInsert = placeDetails.reviews.map(review => ({
        attorney_id: attorneyId,
        author_name: review.authorAttribution.displayName || 'Anonymous',
        author_photo_url: review.authorAttribution.photoUri || null,
        rating: Math.max(1, Math.min(5, review.rating)), // Ensure rating is 1-5
        text: review.text?.text || '',
        time: new Date(review.publishTime).getTime(),
        relative_time_description: review.relativePublishTimeDescription || 'Recently',
      }));

      const { error: insertError } = await supabase
        .from('google_reviews')
        .insert(reviewsToInsert);

      if (insertError) {
        console.error('Error inserting reviews:', insertError);
        return { success: false, error: 'Failed to cache reviews' };
      }

      reviewsCount = reviewsToInsert.length;
    }

    console.log(`✅ Successfully synced ${reviewsCount} reviews for ${attorney.full_name}`);

    return {
      success: true,
      reviewsCount,
      rating: placeDetails.rating,
      reviewCount: placeDetails.userRatingCount,
    };
  } catch (error) {
    console.error('Error in syncAttorneyReviews:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Check if reviews should be synced based on last sync time
 * @param lastSynced - ISO timestamp of last sync
 * @returns boolean indicating if sync is needed
 */
export function shouldSyncReviews(lastSynced: string | null): boolean {
  if (!lastSynced) return true;
  
  try {
    const lastSyncDate = new Date(lastSynced);
    const hoursSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60);
    
    // Sync if more than 24 hours old
    return hoursSinceSync > 24;
  } catch (error) {
    console.error('Error parsing last sync date:', error);
    return true; // Sync if we can't parse the date
  }
}

/**
 * Get cached reviews for an attorney with fallback for test data
 * @param attorneyId - Attorney UUID
 * @returns Array of cached reviews or empty array
 */
export async function getCachedReviews(attorneyId: string) {
  try {
    const supabase = await createClient();
    
    const { data: reviews, error } = await supabase
      .from('google_reviews')
      .select('*')
      .eq('attorney_id', attorneyId)
      .order('time', { ascending: false });

    if (error) {
      console.error('Error fetching cached reviews:', error);
      return [];
    }

    return reviews || [];
  } catch (error) {
    console.error('Error in getCachedReviews:', error);
    return [];
  }
}

