import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing primary category functionality...');

    // Get practice areas to find a category ID
    const practiceAreasResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/practice-areas`);
    const practiceAreasData = await practiceAreasResponse.json();
    
    if (!practiceAreasData.categories || practiceAreasData.categories.length === 0) {
      throw new Error('No practice areas available for testing');
    }

    // Get the first category and some practice areas
    const firstCategory = practiceAreasData.categories[0];
    const practiceAreaIds = firstCategory.practice_areas?.slice(0, 2).map((pa: any) => pa.id) || [];
    
    if (practiceAreaIds.length === 0) {
      throw new Error('No practice areas found in categories');
    }

    console.log('Testing with category:', firstCategory.name);
    console.log('Category ID:', firstCategory.id);
    console.log('Practice area IDs:', practiceAreaIds);

    // Test the profile update with primary category
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/attorney/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Test',
        last_name: 'Attorney',
        bio: 'Testing primary category functionality at ' + new Date().toISOString(),
        practice_areas: practiceAreaIds,
        primary_practice_area: firstCategory.id, // This is now the category ID, not practice area ID
      }),
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: response.ok,
      message: response.ok ? 'Primary category test successful' : 'Primary category test failed',
      data: {
        category: firstCategory,
        practiceAreas: practiceAreaIds,
        profileUpdate: data
      }
    });

  } catch (error: any) {
    console.error('Error in primary category test:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
