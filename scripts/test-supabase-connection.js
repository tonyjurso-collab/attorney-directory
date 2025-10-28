#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * 
 * This script tests the Supabase connection to identify session creation issues.
 * 
 * Usage: node scripts/test-supabase-connection.js
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection');
  console.log('==============================');
  
  // Check environment variables
  console.log('\n1. Environment Variables:');
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase environment variables');
    return;
  }
  
  try {
    // Test Supabase connection
    console.log('\n2. Testing Supabase Connection:');
    
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('   ✅ Supabase connection successful');
    } else {
      console.log('   ❌ Supabase connection failed');
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.log('   ❌ Supabase connection error:', error.message);
  }
  
  // Test session table access
  try {
    console.log('\n3. Testing Session Table Access:');
    
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/chat_sessions?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Session table accessible');
      console.log(`   Sample data:`, data);
    } else {
      console.log('   ❌ Session table access failed');
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.log('   ❌ Session table access error:', error.message);
  }
  
  // Test session creation
  try {
    console.log('\n4. Testing Session Creation:');
    
    const testSession = {
      sid: `test-${Date.now()}`,
      ip_address: '192.168.1.100',
      user_agent: 'TestAgent/1.0',
      landing_page_url: 'https://test.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      stage: 'intake',
      main_category: 'test',
      sub_category: 'other',
      answers: {},
      transcript: []
    };
    
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/chat_sessions`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(testSession)
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Session creation successful');
    } else {
      console.log('   ❌ Session creation failed');
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.log('   ❌ Session creation error:', error.message);
  }
  
  console.log('\n🔍 Supabase test complete');
}

// Run the test
testSupabaseConnection().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
