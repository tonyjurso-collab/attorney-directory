import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    console.log('🔄 Starting profiles table migration...');
    
    // Add new columns
    const { error: addColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS first_name TEXT,
        ADD COLUMN IF NOT EXISTS last_name TEXT;
      `
    });

    if (addColumnsError) {
      console.error('❌ Error adding columns:', addColumnsError);
      return NextResponse.json({ error: 'Failed to add columns' }, { status: 500 });
    }

    console.log('✅ Added first_name and last_name columns');

    // Migrate existing data
    const { error: migrateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.profiles 
        SET 
          first_name = CASE 
            WHEN full_name IS NOT NULL AND full_name != '' THEN 
              TRIM(SPLIT_PART(full_name, ' ', 1))
            ELSE NULL 
          END,
          last_name = CASE 
            WHEN full_name IS NOT NULL AND full_name != '' AND POSITION(' ' IN full_name) > 0 THEN 
              TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
            ELSE NULL 
          END
        WHERE first_name IS NULL OR last_name IS NULL;
      `
    });

    if (migrateError) {
      console.error('❌ Error migrating data:', migrateError);
      return NextResponse.json({ error: 'Failed to migrate data' }, { status: 500 });
    }

    console.log('✅ Migrated existing full_name data to first_name and last_name');

    // Add indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
        CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return NextResponse.json({ error: 'Failed to create indexes' }, { status: 500 });
    }

    console.log('✅ Created indexes for first_name and last_name');

    return NextResponse.json({ 
      success: true, 
      message: 'Profiles table migration completed successfully' 
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
