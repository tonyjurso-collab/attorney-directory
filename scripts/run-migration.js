#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script runs the chat_sessions table migration to add missing columns.
 * 
 * Usage: node scripts/run-migration.js
 */

const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
config({ path: '.env.local' });

async function runMigration() {
  console.log('🔄 Running Database Migration');
  console.log('============================');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../lib/database/migrate-chat-sessions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    
    // Execute the migration
    console.log('🚀 Executing migration...');
    
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: migrationSQL
      })
    });
    
    if (response.ok) {
      console.log('✅ Migration executed successfully');
      const result = await response.json();
      console.log('📊 Result:', result);
    } else {
      console.log('❌ Migration failed');
      const error = await response.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.log('❌ Migration error:', error.message);
  }
  
  // Test the table structure
  try {
    console.log('\n🔍 Verifying table structure...');
    
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_name = 'chat_sessions' 
              AND table_schema = 'public'
              ORDER BY ordinal_position;`
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('📋 Table structure:');
      console.table(result);
    } else {
      console.log('❌ Failed to verify table structure');
    }
    
  } catch (error) {
    console.log('❌ Verification error:', error.message);
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('❌ Migration script error:', error);
  process.exit(1);
});
