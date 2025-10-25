import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing category structure...');

    // Get practice areas to verify the structure
    const practiceAreasResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/practice-areas`);
    const practiceAreasData = await practiceAreasResponse.json();
    
    if (!practiceAreasData.success || !practiceAreasData.categories || practiceAreasData.categories.length === 0) {
      throw new Error('No practice areas available for testing');
    }

    // Analyze the structure
    const firstCategory = practiceAreasData.categories[0];
    const analysis = {
      totalCategories: practiceAreasData.categories.length,
      firstCategory: {
        id: firstCategory.id,
        name: firstCategory.name,
        slug: firstCategory.slug,
        practiceAreasCount: firstCategory.practice_areas?.length || 0,
        practiceAreas: firstCategory.practice_areas?.slice(0, 3).map((pa: any) => ({
          id: pa.id,
          name: pa.name,
          slug: pa.slug
        })) || []
      },
      allCategories: practiceAreasData.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        practiceAreasCount: cat.practice_areas?.length || 0
      }))
    };

    return NextResponse.json({
      success: true,
      message: 'Category structure analysis complete',
      analysis
    });

  } catch (error: any) {
    console.error('Error in category structure test:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
