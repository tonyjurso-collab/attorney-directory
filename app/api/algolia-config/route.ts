import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
  
  if (!appId || !searchKey) {
    return NextResponse.json(
      { error: 'Algolia credentials not configured' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    appId,
    searchKey,
  });
}
