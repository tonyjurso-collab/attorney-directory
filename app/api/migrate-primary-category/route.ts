import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    console.log('Starting primary category migration...');

    // Check if column already exists
    const { data: columnCheck } = await supabase
      .from('attorneys')
      .select('primary_practice_category_id')
      .limit(1);

    if (columnCheck !== null) {
      console.log('Primary category column already exists, skipping migration');
      return NextResponse.json({
        success: true,
        message: 'Primary category column already exists'
      });
    }

    // Since we can't run DDL directly through the client, we'll provide instructions
    console.log('Migration requires manual SQL execution in Supabase dashboard');

    return NextResponse.json({
      success: false,
      message: 'Manual migration required',
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Run the SQL from lib/database/add-primary-category.sql'
      ],
      sqlFile: 'lib/database/add-primary-category.sql'
    });

  } catch (error) {
    console.error('Error in primary category migration:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
