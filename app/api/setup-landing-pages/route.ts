import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Read the SQL migration file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(process.cwd(), 'lib', 'database', 'add-landing-page-fields.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter((stmt: string) => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim());
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
        if (error) {
          console.error('Error executing statement:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Landing page fields added successfully' 
    });
  } catch (error) {
    console.error('Error setting up landing pages:', error);
    return NextResponse.json({ error: 'Failed to setup landing pages' }, { status: 500 });
  }
}
