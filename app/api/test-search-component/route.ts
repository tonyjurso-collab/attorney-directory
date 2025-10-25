import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, practice_area, tier, location, radius } = body;
    
    console.log('🔍 Search Component Test - Input:', {
      query,
      practice_area,
      tier,
      location,
      radius
    });

    // Test the exact same logic as the search component
    let searchResults = [];
    
    try {
      // Simulate Algolia search (this will fail)
      console.log('🧪 Testing Algolia search...');
      throw new Error('Algolia not configured for test');
    } catch (error) {
      console.log('❌ Algolia search failed, falling back to Supabase...');
      
      // Fallback to Supabase search (same as search component)
      try {
        const response = await fetch('http://localhost:3000/api/search/supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            practice_area,
            tier,
            location,
            radius
          })
        });
        
        console.log('📡 Supabase API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          searchResults = data.results || [];
          console.log('✅ Supabase fallback search successful:', searchResults.length, 'results');
        } else {
          const errorData = await response.json();
          console.error('❌ Supabase fallback failed:', errorData);
          searchResults = [];
        }
      } catch (fallbackError) {
        console.error('❌ Supabase fallback error:', fallbackError);
        searchResults = [];
      }
    }
    
    return NextResponse.json({
      message: 'Search component test completed',
      input: { query, practice_area, tier, location, radius },
      results: searchResults,
      resultCount: searchResults.length
    });
  } catch (error) {
    console.error('Error in test-search-component route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
