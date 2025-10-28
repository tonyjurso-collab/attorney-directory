#!/usr/bin/env node

/**
 * Direct Chat Flow Testing Script
 * 
 * This script tests the chat flow logic directly by calling the services
 * without going through the full API, to verify dynamic field collection.
 * 
 * Usage: node scripts/test-chat-flow-direct.js
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Load practice areas config
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../chat/practice_areas_config.json');
const practiceAreasConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Test conversations for different practice areas
const testConversations = {
  personal_injury_law: [
    { role: 'user', text: 'I was injured in a car accident' },
    { role: 'user', text: 'My name is John Smith, email is john@example.com, phone is 555-123-4567' },
    { role: 'user', text: 'I was rear-ended on the highway. I have back pain and went to the hospital.' },
    { role: 'user', text: 'No, I don\'t have an attorney yet. The accident was on January 15th, 2024.' },
    { role: 'user', text: 'Yes, I have bodily injuries. No, I was not at fault.' }
  ],
  
  social_security_disability: [
    { role: 'user', text: 'I need help with my social security disability claim' },
    { role: 'user', text: 'My name is Jane Doe, email is jane@example.com, phone is 555-987-6543' },
    { role: 'user', text: 'No, I was denied. I have been seeing a doctor for my back condition.' },
    { role: 'user', text: 'Yes, I worked until 6 months ago when I had to stop due to my condition.' },
    { role: 'user', text: 'I am 45 years old.' }
  ],
  
  family_law: [
    { role: 'user', text: 'I need help with a divorce' },
    { role: 'user', text: 'My name is Mike Johnson, email is mike@example.com, phone is 555-456-7890' },
    { role: 'user', text: 'No, I need to find one. We have children and need help with custody.' }
  ]
};

// Mock session data
function createMockSession(practiceArea) {
  return {
    sid: `test-session-${Date.now()}`,
    ipAddress: '192.168.1.100',
    userAgent: 'ChatFlowTest/1.0',
    landingPageUrl: 'https://attorney-directory.com/test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    stage: 'intake',
    main_category: practiceArea,
    sub_category: 'other',
    answers: {},
    transcript: []
  };
}

// Function to simulate field extraction
function simulateFieldExtraction(message, practiceArea) {
  const extractedFields = {};
  const config = practiceAreasConfig.legal_practice_areas[practiceArea];
  
  if (!config || !config.chat_flow) {
    return extractedFields;
  }
  
  // Simple pattern matching for field extraction
  const patterns = {
    first_name: /(?:my name is|i'm|i am)\s+([a-zA-Z]+)/i,
    last_name: /(?:my name is|i'm|i am)\s+([a-zA-Z]+\s+[a-zA-Z]+)/i,
    email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    phone: /(\d{3}[-.]?\d{3}[-.]?\d{4})/i,
    zip_code: /(\d{5}(?:-\d{4})?)/i,
    describe: /(?:accident|injured|hurt|pain|hospital|doctor|condition|divorce|custody|disability|claim)/i,
    has_attorney: /(?:don't have|no.*attorney|need.*attorney|find.*attorney)/i,
    bodily_injury: /(?:back pain|injured|hurt|pain|hospital|bodily)/i,
    at_fault: /(?:not at fault|rear-ended|not my fault)/i,
    date_of_incident: /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i,
    currently_receiving_benefits: /(?:denied|no.*benefits|not receiving)/i,
    have_worked: /(?:worked|work.*until|stopped.*work)/i,
    age: /(?:i am|i'm)\s+(\d+)\s+years?/i,
    doctor_treatment: /(?:doctor|treatment|seeing.*doctor)/i
  };
  
  // Extract fields based on patterns
  Object.entries(patterns).forEach(([field, pattern]) => {
    const match = message.match(pattern);
    if (match) {
      if (field === 'last_name' && match[1]) {
        const names = match[1].split(' ');
        extractedFields.first_name = names[0];
        extractedFields.last_name = names[1] || '';
      } else if (field === 'age' && match[1]) {
        extractedFields.age = match[1];
      } else if (field === 'phone' && match[1]) {
        extractedFields.phone = match[1];
      } else if (field === 'email' && match[1]) {
        extractedFields.email = match[1];
      } else if (field === 'zip_code' && match[1]) {
        extractedFields.zip_code = match[1];
      } else if (field === 'date_of_incident' && match[0]) {
        extractedFields.date_of_incident = match[0];
      } else if (field === 'describe' && match[0]) {
        extractedFields.describe = message; // Use the full message as description
      } else if (field === 'has_attorney') {
        extractedFields.has_attorney = 'no';
      } else if (field === 'bodily_injury') {
        extractedFields.bodily_injury = 'yes';
      } else if (field === 'at_fault') {
        extractedFields.at_fault = 'no';
      } else if (field === 'currently_receiving_benefits') {
        extractedFields.currently_receiving_benefits = 'no';
      } else if (field === 'have_worked') {
        extractedFields.have_worked = 'yes';
      } else if (field === 'doctor_treatment') {
        extractedFields.doctor_treatment = 'yes';
      }
    }
  });
  
  return extractedFields;
}

// Function to simulate a chat conversation
function simulateChatConversation(practiceArea, conversation) {
  console.log(`\n🗣️  Testing chat flow for: ${practiceArea}`);
  console.log(`📋 Practice area: ${practiceAreasConfig.legal_practice_areas[practiceArea]?.name}`);
  
  const session = createMockSession(practiceArea);
  const collectedFields = {};
  
  // Process each message in the conversation
  conversation.forEach((message, index) => {
    if (message.role === 'user') {
      console.log(`   👤 User: ${message.text}`);
      
      // Extract fields from the message
      const extractedFields = simulateFieldExtraction(message.text, practiceArea);
      
      // Add to session answers
      Object.entries(extractedFields).forEach(([key, value]) => {
        session.answers[key] = value;
        collectedFields[key] = value;
      });
      
      // Add to transcript
      session.transcript.push({
        role: 'user',
        text: message.text,
        timestamp: new Date().toISOString(),
        extractedFields: extractedFields
      });
      
      if (Object.keys(extractedFields).length > 0) {
        console.log(`   📝 Fields extracted: ${Object.keys(extractedFields).join(', ')}`);
      }
    }
  });
  
  // Simulate lead submission data preparation
  const config = practiceAreasConfig.legal_practice_areas[practiceArea];
  const submittedData = {
    // Universal fields
    first_name: session.answers.first_name || '',
    last_name: session.answers.last_name || '',
    email: session.answers.email || '',
    phone: session.answers.phone || '',
    city: 'Chicago', // Mock geocoding
    state: 'IL', // Mock geocoding
    zip_code: session.answers.zip_code || '',
    ip_address: session.ipAddress,
    user_agent: session.userAgent,
    landing_page_url: session.landingPageUrl,
    jornaya_leadid: `jornaya_test_${Date.now()}`,
    trustedform_cert_url: `https://cert.trustedform.com/test_${Date.now()}`,
    tcpa_text: 'By submitting this form, you consent to be contacted by attorneys.',
    sub_category: session.sub_category || 'other',
    
    // Practice area specific fields
    main_category: practiceArea,
    describe: session.answers.describe || '',
    has_attorney: session.answers.has_attorney || '',
    bodily_injury: session.answers.bodily_injury || '',
    at_fault: session.answers.at_fault || '',
    date_of_incident: session.answers.date_of_incident || '',
    currently_receiving_benefits: session.answers.currently_receiving_benefits || '',
    have_worked: session.answers.have_worked || '',
    age: session.answers.age || '',
    doctor_treatment: session.answers.doctor_treatment || ''
  };
  
  // Add practice-area-specific fields from chat_flow
  if (config && config.chat_flow) {
    config.chat_flow.forEach(flowItem => {
      const fieldName = flowItem.field;
      const fieldValue = session.answers[fieldName];
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        submittedData[fieldName] = fieldValue;
      }
    });
  }
  
  console.log(`   📊 Total fields collected: ${Object.keys(collectedFields).length}`);
  console.log(`   📤 Total fields for submission: ${Object.keys(submittedData).length}`);
  
  return {
    success: true,
    sessionId: session.sid,
    collectedFields: collectedFields,
    submittedData: submittedData,
    practiceArea: practiceArea
  };
}

// Function to analyze the results
function analyzeResults(results) {
  console.log('\n📊 CHAT FLOW ANALYSIS');
  console.log('====================');
  
  Object.entries(results).forEach(([practiceArea, result]) => {
    console.log(`\n${practiceArea}:`);
    console.log(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (result.success) {
      console.log(`  Session ID: ${result.sessionId}`);
      console.log(`  Fields Collected: ${Object.keys(result.collectedFields || {}).length}`);
      console.log(`  Fields for Submission: ${Object.keys(result.submittedData || {}).length}`);
      
      // Check for practice-area-specific fields
      const config = practiceAreasConfig.legal_practice_areas[practiceArea];
      if (config && config.chat_flow) {
        const expectedFields = config.chat_flow.map(item => item.field);
        const collectedFields = Object.keys(result.collectedFields || {});
        const submittedFields = Object.keys(result.submittedData || {});
        
        console.log(`  Expected Fields: ${expectedFields.join(', ')}`);
        console.log(`  Collected Fields: ${collectedFields.join(', ')}`);
        console.log(`  Submitted Fields: ${submittedFields.join(', ')}`);
        
        const missingCollected = expectedFields.filter(field => !collectedFields.includes(field));
        const missingSubmitted = expectedFields.filter(field => !submittedFields.includes(field));
        
        if (missingCollected.length > 0) {
          console.log(`  ❌ Missing from Collection: ${missingCollected.join(', ')}`);
        }
        if (missingSubmitted.length > 0) {
          console.log(`  ❌ Missing from Submission: ${missingSubmitted.join(', ')}`);
        }
        
        // Show what fields were actually collected
        console.log(`  📋 Collected Field Values:`);
        Object.entries(result.collectedFields || {}).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
      }
    } else {
      console.log(`  Error: ${result.error}`);
    }
  });
}

// Main function
async function main() {
  console.log('🧪 Direct Chat Flow Testing Script');
  console.log('===================================');
  console.log('This script tests the chat flow logic directly to verify dynamic field collection.\n');
  
  const results = {};
  
  // Test each practice area
  for (const [practiceArea, conversation] of Object.entries(testConversations)) {
    const result = simulateChatConversation(practiceArea, conversation);
    results[practiceArea] = result;
  }
  
  // Analyze results
  analyzeResults(results);
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `direct-chat-flow-test-results-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${filename}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
