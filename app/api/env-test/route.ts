import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Environment variables check',
      algoliaAppId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? 'SET' : 'NOT SET',
      algoliaAdminKey: process.env.ALGOLIA_ADMIN_API_KEY ? 'SET' : 'NOT SET',
      algoliaSearchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ? 'SET' : 'NOT SET',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET'
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({ 
      error: 'Environment test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
