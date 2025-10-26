// Test the reset functionality
const testReset = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing reset functionality...\n');
  
  let cookies = '';
  
  try {
    // Step 1: Start a conversation
    console.log('Step 1: Starting conversation');
    const response1 = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I need help with a divorce' })
    });
    
    cookies = response1.headers.get('set-cookie') || '';
    const result1 = await response1.json();
    console.log('Response:', result1.answer);
    console.log('Category:', result1.debug.category);
    console.log('');
    
    // Step 2: Send another message to build up conversation
    console.log('Step 2: Building conversation');
    const response2 = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ message: 'Tom' })
    });
    const result2 = await response2.json();
    console.log('Response:', result2.answer);
    console.log('');
    
    // Step 3: Reset the conversation
    console.log('Step 3: Resetting conversation');
    const resetResponse = await fetch(`${baseUrl}/api/chat/reset`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    const resetResult = await resetResponse.json();
    console.log('Reset result:', resetResult);
    console.log('');
    
    // Step 4: Start fresh conversation
    console.log('Step 4: Starting fresh conversation');
    const response3 = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ message: 'I need help with a car accident' })
    });
    const result3 = await response3.json();
    console.log('Response:', result3.answer);
    console.log('Category:', result3.debug.category);
    console.log('Collected fields:', Object.keys(result3.debug.collected || {}));
    console.log('');
    
    // Check if it's truly reset
    if (Object.keys(result3.debug.collected || {}).length === 0) {
      console.log('✅ SUCCESS: Reset worked correctly - no previous data');
    } else {
      console.log('❌ ISSUE: Reset failed - still has previous data');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testReset();
