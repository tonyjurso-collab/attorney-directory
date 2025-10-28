#!/usr/bin/env node

/**
 * Chat Flow Testing Script
 * 
 * This script simulates actual chat conversations to test dynamic field collection
 * and verify that practice-area-specific fields are being collected and submitted correctly.
 * 
 * Usage: node scripts/test-chat-flow.js
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
    { role: 'assistant', text: 'I\'m sorry to hear about your accident. Let me help you find a personal injury attorney.' },
    { role: 'user', text: 'My name is John Smith, email is john@example.com, phone is 555-123-4567' },
    { role: 'assistant', text: 'Thank you John. What happened in the accident?' },
    { role: 'user', text: 'I was rear-ended on the highway. I have back pain and went to the hospital.' },
    { role: 'assistant', text: 'I understand. Do you currently have an attorney representing you?' },
    { role: 'user', text: 'No, I don\'t have an attorney yet. The accident was on January 15th, 2024.' },
    { role: 'assistant', text: 'Thank you. Let me connect you with a personal injury attorney in your area.' }
  ],
  
  social_security_disability: [
    { role: 'user', text: 'I need help with my social security disability claim' },
    { role: 'assistant', text: 'I can help you find an attorney for your SSDI case. Let me gather some information.' },
    { role: 'user', text: 'My name is Jane Doe, email is jane@example.com, phone is 555-987-6543' },
    { role: 'assistant', text: 'Thank you Jane. Are you currently receiving any disability benefits?' },
    { role: 'user', text: 'No, I was denied. I have been seeing a doctor for my back condition.' },
    { role: 'assistant', text: 'I understand. Have you worked in the past 5 years?' },
    { role: 'user', text: 'Yes, I worked until 6 months ago when I had to stop due to my condition.' },
    { role: 'assistant', text: 'Thank you. How old are you?' },
    { role: 'user', text: 'I am 45 years old.' },
    { role: 'assistant', text: 'Perfect. Let me connect you with an SSDI attorney.' }
  ],
  
  family_law: [
    { role: 'user', text: 'I need help with a divorce' },
    { role: 'assistant', text: 'I can help you find a family law attorney for your divorce case.' },
    { role: 'user', text: 'My name is Mike Johnson, email is mike@example.com, phone is 555-456-7890' },
    { role: 'assistant', text: 'Thank you Mike. Do you currently have an attorney?' },
    { role: 'user', text: 'No, I need to find one. We have children and need help with custody.' },
    { role: 'assistant', text: 'I understand. Let me connect you with a family law attorney.' }
  ]
};

// Function to simulate a chat conversation
async function simulateChatConversation(practiceArea, conversation) {
  console.log(`\n🗣️  Testing chat flow for: ${practiceArea}`);
  console.log(`📋 Practice area: ${practiceAreasConfig.legal_practice_areas[practiceArea]?.name}`);
  
  let sessionId = null;
  const collectedFields = {};
  
  try {
    // Step 1: Start a new chat session
    console.log('   🔄 Starting new chat session...');
    const sessionResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChatFlowTest/1.0',
        'X-Forwarded-For': '192.168.1.100',
        'Referer': 'https://attorney-directory.com/test'
      },
      body: JSON.stringify({
        message: conversation[0].text,
        practiceArea: practiceArea
      })
    });
    
    const sessionResult = await sessionResponse.json();
    sessionId = sessionResult.sessionId;
    console.log(`   ✅ Session started: ${sessionId}`);
    
    // Step 2: Continue the conversation
    for (let i = 1; i < conversation.length; i++) {
      const message = conversation[i];
      
      if (message.role === 'user') {
        console.log(`   👤 User: ${message.text}`);
        
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ChatFlowTest/1.0',
            'X-Forwarded-For': '192.168.1.100',
            'Referer': 'https://attorney-directory.com/test'
          },
          body: JSON.stringify({
            message: message.text,
            sessionId: sessionId
          })
        });
        
        const result = await response.json();
        console.log(`   🤖 Assistant: ${result.response}`);
        
        // Check if any fields were collected
        if (result.collectedFields) {
          Object.assign(collectedFields, result.collectedFields);
          console.log(`   📝 Fields collected: ${Object.keys(result.collectedFields).join(', ')}`);
        }
      }
    }
    
    // Step 3: Submit the lead
    console.log('   📤 Submitting lead...');
    const submitResponse = await fetch('http://localhost:3000/api/chat/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChatFlowTest/1.0',
        'X-Forwarded-For': '192.168.1.100',
        'Referer': 'https://attorney-directory.com/test'
      },
      body: JSON.stringify({
        sessionId: sessionId
      })
    });
    
    const submitResult = await submitResponse.json();
    
    if (submitResult.success) {
      console.log(`   ✅ Lead submitted successfully!`);
      console.log(`   🆔 Lead ID: ${submitResult.lead_id}`);
      console.log(`   📊 Fields submitted: ${Object.keys(submitResult.submittedData || {}).length}`);
      
      // Show what fields were actually submitted
      if (submitResult.submittedData) {
        console.log('   📋 Submitted fields:');
        Object.entries(submitResult.submittedData).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
      }
      
      return {
        success: true,
        leadId: submitResult.lead_id,
        sessionId: sessionId,
        collectedFields: collectedFields,
        submittedData: submitResult.submittedData
      };
    } else {
      console.log(`   ❌ Lead submission failed: ${submitResult.error}`);
      return {
        success: false,
        error: submitResult.error,
        sessionId: sessionId,
        collectedFields: collectedFields
      };
    }
    
  } catch (error) {
    console.log(`   💥 Error during conversation: ${error.message}`);
    return {
      success: false,
      error: error.message,
      sessionId: sessionId,
      collectedFields: collectedFields
    };
  }
}

// Function to analyze the results
function analyzeResults(results) {
  console.log('\n📊 CHAT FLOW ANALYSIS');
  console.log('====================');
  
  Object.entries(results).forEach(([practiceArea, result]) => {
    console.log(`\n${practiceArea}:`);
    console.log(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (result.success) {
      console.log(`  Lead ID: ${result.lead_id}`);
      console.log(`  Session ID: ${result.sessionId}`);
      console.log(`  Fields Collected: ${Object.keys(result.collectedFields || {}).length}`);
      console.log(`  Fields Submitted: ${Object.keys(result.submittedData || {}).length}`);
      
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
      }
    } else {
      console.log(`  Error: ${result.error}`);
    }
  });
}

// Main function
async function main() {
  console.log('🧪 Chat Flow Testing Script');
  console.log('============================');
  console.log('This script will simulate actual chat conversations to test dynamic field collection.\n');
  
  const results = {};
  
  // Test each practice area
  for (const [practiceArea, conversation] of Object.entries(testConversations)) {
    const result = await simulateChatConversation(practiceArea, conversation);
    results[practiceArea] = result;
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Analyze results
  analyzeResults(results);
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `chat-flow-test-results-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${filename}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
