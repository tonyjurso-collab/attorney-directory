/**
 * Test Script: Remote PHP API Integration
 * Tests the integration with the remote LegalHub PHP chat API
 */

const REMOTE_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://freshlocal.co/chat/api';

async function testRemoteAPI() {
  console.log('🧪 Testing Remote PHP API Integration\n');
  console.log(`API URL: ${REMOTE_API_URL}\n`);

  let sessionId: string | undefined;

  try {
    // Test 1: Send first message (category detection)
    console.log('📤 Test 1: Sending initial chat message...');
    const response1 = await fetch(`${REMOTE_API_URL}/ask.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: 'I was in a car accident',
        session_id: sessionId,
      }),
    });

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }

    const data1 = await response1.json();
    console.log('✅ Response:', {
      answer: data1.answer?.substring(0, 100) + '...',
      session_id: data1.session_id,
      debug: data1.debug,
    });

    sessionId = data1.session_id;

    // Test 2: Follow-up message (field collection)
    console.log('\n📤 Test 2: Sending follow-up message...');
    const response2 = await fetch(`${REMOTE_API_URL}/ask.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: 'It happened last week in Charlotte',
        session_id: sessionId,
      }),
    });

    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
    }

    const data2 = await response2.json();
    console.log('✅ Response:', {
      answer: data2.answer?.substring(0, 100) + '...',
      session_id: data2.session_id,
      step: data2.debug?.step,
      fields_collected: data2.debug?.fields_collected,
    });

    // Test 3: Reset session
    console.log('\n📤 Test 3: Resetting session...');
    const response3 = await fetch(`${REMOTE_API_URL}/reset_session.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    if (!response3.ok) {
      throw new Error(`HTTP ${response3.status}: ${response3.statusText}`);
    }

    const data3 = await response3.json();
    console.log('✅ Response:', data3);

    console.log('\n✅ All tests passed! Remote API integration is working correctly.\n');
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run tests
testRemoteAPI();

export {};

