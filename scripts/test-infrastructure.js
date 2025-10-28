#!/usr/bin/env node

/**
 * Test script to verify the chat system infrastructure
 * Run with: node scripts/test-infrastructure.js
 */

const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Load environment variables
config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials not found in environment variables');
    return false;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test basic Supabase operations
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function testOpenAIConnection() {
  console.log('🔍 Testing OpenAI connection...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OpenAI API key not found in environment variables');
    return false;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    // Test with a simple completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
      max_tokens: 10,
    });

    if (response.choices[0].message.content) {
      console.log('✅ OpenAI connection successful');
      return true;
    } else {
      console.error('❌ OpenAI test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
    return false;
  }
}

async function testConfigLoading() {
  console.log('🔍 Testing configuration loading...');
  
  try {
    // Test if config file exists and is valid JSON
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(process.cwd(), 'config', 'practice_areas_config.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    if (config && config.practiceAreas && config.practiceAreas.length > 0) {
      console.log(`✅ Configuration loaded successfully (${config.practiceAreas.length} practice areas)`);
      return true;
    } else {
      console.error('❌ Configuration loading failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Configuration loading failed:', error.message);
    return false;
  }
}

async function testSessionManagement() {
  console.log('🔍 Testing session management...');
  
  try {
    // Test Supabase session operations directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Generate a test session ID
    const { v4: uuidv4 } = require('uuid');
    const sessionId = uuidv4();
    console.log(`Generated session ID: ${sessionId}`);
    
    // Test creating a session
    const { data: insertData, error: insertError } = await supabase
      .from('chat_sessions')
      .insert({
        sid: sessionId,
        ip_address: '127.0.0.1',
        user_agent: 'Test User Agent',
        stage: 'COLLECTING',
        answers: {},
        asked: [],
        transcript: [],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Session creation failed:', insertError.message);
      return false;
    }
    
    console.log('✅ Session created successfully');
    
    // Test retrieving the session
    const { data: selectData, error: selectError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('sid', sessionId)
      .single();

    if (selectError) {
      console.error('❌ Session retrieval failed:', selectError.message);
      return false;
    }
    
    console.log('✅ Session retrieval successful');
    
    // Clean up
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('sid', sessionId);

    if (deleteError) {
      console.error('❌ Session cleanup failed:', deleteError.message);
      return false;
    }
    
    console.log('✅ Session cleanup successful');
    
    return true;
  } catch (error) {
    console.error('❌ Session management test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting infrastructure tests...\n');
  
  const tests = [
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'OpenAI Connection', fn: testOpenAIConnection },
    { name: 'Configuration Loading', fn: testConfigLoading },
    { name: 'Session Management', fn: testSessionManagement },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      results.push({ name: test.name, success: false });
    }
    console.log(''); // Add spacing between tests
  }
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Infrastructure is ready.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});