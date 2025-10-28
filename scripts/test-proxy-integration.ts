/**
 * Test Script: Frontend API Proxy Integration
 * Tests the complete flow through the Next.js API routes
 */

const LOCAL_API_URL = 'http://localhost:3000/api';

async function testProxyIntegration() {
  console.log('🧪 Testing Frontend API Proxy Integration\n');
  console.log(`Local API URL: ${LOCAL_API_URL}\n`);

  try {
    // Test 1: Health check
    console.log('📤 Test 1: Health check...');
    const healthCheck = await fetch(`${LOCAL_API_URL}/chat`, {
      method: 'GET',
    });

    if (!healthCheck.ok) {
      throw new Error(`Health check failed: HTTP ${healthCheck.status}`);
    }

    const health = await healthCheck.json();
    console.log('✅ Health check response:', health);

    // Test 2: Send first chat message through proxy
    console.log('\n📤 Test 2: Sending chat message through proxy...');
    const chatResponse1 = await fetch(`${LOCAL_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I was in a car accident last week',
        meta: {
          location: 'http://localhost:3000/test',
          referrer: 'http://localhost:3000',
        },
        session_id: null, // Will be generated server-side
      }),
    });

    if (!chatResponse1.ok) {
      throw new Error(`Chat failed: HTTP ${chatResponse1.status}`);
    }

    const data1 = await chatResponse1.json();
    console.log('✅ Response:', {
      reply: data1.reply?.substring(0, 100) + '...',
      session_id: data1.session_id,
      complete: data1.complete,
      debug: {
        mainCategory: data1.debug?.mainCategory,
        subCategory: data1.debug?.subCategory,
        stage: data1.debug?.stage,
      },
    });

    // Test 3: Send follow-up message
    console.log('\n📤 Test 3: Sending follow-up message...');
    const chatResponse2 = await fetch(`${LOCAL_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'My name is John and I live in Charlotte',
        meta: {
          location: 'http://localhost:3000/test',
          referrer: 'http://localhost:3000',
        },
        session_id: data1.session_id,
      }),
    });

    if (!chatResponse2.ok) {
      throw new Error(`Follow-up failed: HTTP ${chatResponse2.status}`);
    }

    const data2 = await chatResponse2.json();
    console.log('✅ Response:', {
      reply: data2.reply?.substring(0, 100) + '...',
      session_id: data2.session_id,
      complete: data2.complete,
      field_asked: data2.field_asked,
    });

    // Test 4: Reset session through proxy
    console.log('\n📤 Test 4: Resetting session through proxy...');
    const resetResponse = await fetch(`${LOCAL_API_URL}/chat/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: data1.session_id,
      }),
    });

    if (!resetResponse.ok) {
      throw new Error(`Reset failed: HTTP ${resetResponse.status}`);
    }

    const resetData = await resetResponse.json();
    console.log('✅ Response:', resetData);

    console.log('\n✅ All proxy tests passed! Integration is working correctly.\n');
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run tests
testProxyIntegration();

export {};

