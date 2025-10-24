import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
    const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;

    return NextResponse.json({ 
      message: 'Algolia configuration test',
      configured: {
        appId: !!appId,
        searchKey: !!searchKey,
        adminKey: !!adminKey,
      },
      appId: appId ? `${appId.substring(0, 8)}...` : 'Not set',
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
