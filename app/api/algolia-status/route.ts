import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
  
  const isConfigured = !!(appId && searchKey);
  
  return NextResponse.json({
    isConfigured,
    hasAppId: !!appId,
    hasSearchKey: !!searchKey,
  });
}
