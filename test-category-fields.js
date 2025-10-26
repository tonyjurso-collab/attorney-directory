// Test the category-specific required fields fix
const testCategoryFields = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing category-specific required fields...\n');
  
  let cookies = '';
  
  try {
    // Step 1: Start family law conversation
    console.log('Step 1: Starting family law conversation');
    const response1 = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want a divorce' })
    });
    
    cookies = response1.headers.get('set-cookie') || '';
    const result1 = await response1.json();
    console.log('Response:', result1.answer);
    console.log('Category:', result1.debug.category);
    console.log('Missing fields:', result1.debug.missing);
    console.log('');
    
    // Step 2: Provide basic fields
    console.log('Step 2: Providing basic fields');
    const response2 = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ message: 'Tom Smith tom@test.com 555-123-4567 12345' })
    });
    const result2 = await response2.json();
    console.log('Response:', result2.answer);
    console.log('Missing fields:', result2.debug.missing);
    console.log('');
    
    // Step 3: Provide has_attorney
    console.log('Step 3: Answering has_attorney question');
    const response3 = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ message: 'no' })
    });
    const result3 = await response3.json();
    console.log('Response:', result3.answer);
    console.log('Missing fields:', result3.debug.missing);
    console.log('');
    
    // Check if it's ready to submit (should NOT ask for bodily_injury, at_fault, etc.)
    if (result3.debug.missing.length === 0) {
      console.log('✅ SUCCESS: Family law correctly uses only family law fields!');
    } else {
      console.log('❌ ISSUE: Still asking for wrong fields:', result3.debug.missing);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testCategoryFields();
