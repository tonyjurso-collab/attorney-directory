async function testSingleSubmission() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🧪 Testing single lead submission...');
    
    const testData = {
      category: "personal_injury_law",
      first_name: "Test",
      last_name: "User", 
      email: "test@example.com",
      phone: "5551234567",
      zip_code: "12345",
      city: "Test City",
      state: "TS",
      describe: "Test case",
      sub_category: "car accident",
      tcpa_text: "Test consent",
      ip_address: "127.0.0.1",
      user_agent: "Test Agent",
      landing_page_url: "https://test.com",
      jornaya_leadid: "test-jornaya",
      trustedform_cert_url: "https://test-trustedform.com"
    };
    
    console.log('📤 Sending request to /api/lead-capture...');
    const response = await fetch('http://localhost:3000/api/lead-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    const result = await response.json();
    console.log('📥 Response body:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSingleSubmission();
