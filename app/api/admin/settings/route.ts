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

    // For now, return default settings
    // In a real application, you would store these in a settings table
    const settings = {
      siteName: 'Attorney Directory',
      siteDescription: 'Find qualified attorneys in your area',
      contactEmail: 'admin@attorneydirectory.com',
      maxAttorneysPerPage: 20,
      enableRegistration: true,
      requireEmailVerification: true,
      enableChatbot: true,
      enableLeadTracking: true,
      algoliaAppId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
      algoliaSearchKey: process.env.ALGOLIA_SEARCH_API_KEY || '',
      openaiApiKey: process.env.OPENAI_API_KEY ? '***hidden***' : '',
      googlePlacesKey: process.env.GOOGLE_PLACES_API_KEY ? '***hidden***' : '',
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    // In a real application, you would save these settings to a database
    // For now, we'll just return success
    console.log('Settings update requested:', body);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
