#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests the lead-capture API with minimal data
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

async function testAPI() {
  const testData = {
    category: 'personal_injury_law',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    zip_code: '60601',
    sub_category: 'car accident',
    describe: 'Test description',
    has_attorney: 'no',
    date_of_incident: '01/01/2024',
    bodily_injury: 'yes',
    at_fault: 'no'
  };

  console.log('🧪 Testing API with data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/lead-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('📤 API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ SUCCESS - Lead ID:', result.lead_id);
    } else {
      console.log('❌ FAILED - Error:', result.error);
    }
  } catch (error) {
    console.error('💥 EXCEPTION:', error.message);
  }
}

testAPI();
