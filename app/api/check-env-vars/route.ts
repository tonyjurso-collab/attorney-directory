import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
    const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    
    return NextResponse.json({
      message: 'Environment variables check',
      appId: appId ? `${appId.substring(0, 8)}...` : 'NOT SET',
      searchKey: searchKey ? `${searchKey.substring(0, 8)}...` : 'NOT SET',
      adminKey: adminKey ? `${adminKey.substring(0, 8)}...` : 'NOT SET',
      appIdLength: appId?.length || 0,
      searchKeyLength: searchKey?.length || 0,
      adminKeyLength: adminKey?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
