#!/usr/bin/env node

/**
 * Chat API Debug Script
 * 
 * This script tests the chat API endpoints to identify what's causing the connection error.
 * 
 * Usage: node scripts/debug-chat-api.js
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

async function testChatAPI() {
  console.log('🔍 Debugging Chat API Connection Issues');
  console.log('=====================================');
  
  // Test 1: Check if server is responding
  console.log('\n1. Testing server connectivity...');
  try {
    const response = await fetch('http://localhost:3000/api/health-simple', {
      method: 'GET',
      headers: {
        'User-Agent': 'ChatAPIDebug/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('   ✅ Server responding:', data);
    } else {
      console.log('   ❌ Server error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
  }
  
  // Test 2: Check environment variables
  console.log('\n2. Checking environment variables...');
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'LEADPROSPER_API_KEY',
    'LEADPROSPER_API_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${envVar}: NOT SET`);
    }
  });
  
  // Test 3: Test chat API with minimal data
  console.log('\n3. Testing chat API with minimal data...');
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChatAPIDebug/1.0',
        'X-Forwarded-For': '192.168.1.100',
        'Referer': 'https://attorney-directory.com/test'
      },
      body: JSON.stringify({
        message: 'test message'
      })
    });
    
    console.log('   📡 Response status:', response.status);
    console.log('   📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('   📡 Response body:', responseText.substring(0, 200) + '...');
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('   ✅ Chat API working:', data.reply ? 'Got reply' : 'No reply');
      } catch (parseError) {
        console.log('   ❌ Invalid JSON response');
      }
    } else {
      console.log('   ❌ Chat API error:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.log('   ❌ Chat API request failed:', error.message);
  }
  
  // Test 4: Test session creation
  console.log('\n4. Testing session creation...');
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChatAPIDebug/1.0',
        'X-Forwarded-For': '192.168.1.100',
        'Referer': 'https://attorney-directory.com/test'
      },
      body: JSON.stringify({
        message: 'I need help with a car accident',
        practiceArea: 'personal_injury_law'
      })
    });
    
    const responseText = await response.text();
    console.log('   📡 Session test response:', responseText.substring(0, 300) + '...');
    
  } catch (error) {
    console.log('   ❌ Session test failed:', error.message);
  }
  
  console.log('\n🔍 Debug complete');
}

// Run the debug script
testChatAPI().catch(error => {
  console.error('❌ Debug script error:', error);
  process.exit(1);
});
