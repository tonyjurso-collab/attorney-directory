import { NextRequest, NextResponse } from 'next/server';
import { geocodeAllAttorneys, geocodeSingleAttorney } from '@/lib/scripts/geocode-attorneys';

/**
 * API route to geocode attorneys
 * POST /api/geocode-attorneys - Geocode all attorneys
 * POST /api/geocode-attorneys?attorneyId=xxx - Geocode a single attorney
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attorneyId = searchParams.get('attorneyId');
    
    if (attorneyId) {
      // Geocode a single attorney
      console.log(`Geocoding single attorney: ${attorneyId}`);
      
      const result = await geocodeSingleAttorney(attorneyId);
      
      if (result.success) {
        return NextResponse.json({
          message: 'Attorney geocoded successfully',
          success: true
        });
      } else {
        return NextResponse.json({
          error: result.error,
          success: false
        }, { status: 400 });
      }
    } else {
      // Geocode all attorneys
      console.log('Starting batch geocoding of all attorneys...');
      
      const results = await geocodeAllAttorneys();
      
      return NextResponse.json({
        message: 'Geocoding process completed',
        success: true,
        results: {
          total: results.total,
          successful: results.successful,
          failed: results.failed,
          errorCount: results.errors.length
        },
        errors: results.errors.map(({ attorney, error }) => ({
          attorneyId: attorney.id,
          attorneyName: `${attorney.first_name} ${attorney.last_name}`,
          error
        }))
      });
    }
    
  } catch (error) {
    console.error('Error in geocoding API route:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check geocoding status
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Get statistics about geocoding status
    const { data: stats, error } = await supabase
      .from('attorneys')
      .select('id, latitude, longitude')
      .eq('is_active', true);
    
    if (error) {
      return NextResponse.json({
        error: 'Failed to fetch geocoding statistics',
        message: error.message
      }, { status: 500 });
    }
    
    const total = stats?.length || 0;
    const geocoded = stats?.filter((attorney: { id: string; latitude: number | null; longitude: number | null }) => 
      attorney.latitude !== null && attorney.longitude !== null
    ).length || 0;
    const notGeocoded = total - geocoded;
    
    return NextResponse.json({
      total,
      geocoded,
      notGeocoded,
      geocodingPercentage: total > 0 ? Math.round((geocoded / total) * 100) : 0
    });
    
  } catch (error) {
    console.error('Error fetching geocoding status:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
