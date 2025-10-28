#!/usr/bin/env node

/**
 * Divorce Flow Test Script
 * 
 * This script tests the divorce chat flow to identify why questions are being repeated.
 * 
 * Usage: node scripts/test-divorce-flow.js
 */

const { config } = require('dotenv');
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Test conversation flow for divorce
const divorceConversation = [
  { message: "I need help with a divorce", expectedCategory: "family_law" },
  { message: "My name is Sarah Johnson, my email is sarah@example.com, phone is 555-123-4567, zip is 60601", expectedFields: ['first_name', 'last_name', 'email', 'phone', 'zip_code'] },
  { message: "No, I don't have an attorney yet", expectedFields: ['has_attorney'] },
];

let sessionId = null;
let collectedAnswers = {};

async function sendMessage(message) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat-working`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        meta: {
          timestamp: new Date().toISOString(),
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!sessionId) {
      sessionId = data.session_id;
      console.log(`\n📝 Session ID: ${sessionId}`);
    }

    return data;
  } catch (error) {
    console.error(`\n❌ Error sending message:`, error.message);
    return null;
  }
}

function checkForRepeatingFields(messages, currentField, allFields) {
  const fieldCounts = {};
  
  // Count occurrences of each field being asked
  for (const msg of messages) {
    if (msg.fieldAsked) {
      fieldCounts[msg.fieldAsked] = (fieldCounts[msg.fieldAsked] || 0) + 1;
    }
  }
  
  // Check if current field is already asked
  if (currentField && fieldCounts[currentField] && fieldCounts[currentField] > 1) {
    console.log(`\n⚠️  WARNING: Field "${currentField}" has been asked ${fieldCounts[currentField]} times!`);
    return true;
  }
  
  // Show all repeated fields
  const repeatedFields = Object.entries(fieldCounts)
    .filter(([_, count]) => count > 1)
    .map(([field, count]) => ({ field, count }));
  
  if (repeatedFields.length > 0) {
    console.log(`\n🔄 Repeated fields detected:`);
    repeatedFields.forEach(({ field, count }) => {
      console.log(`   - ${field}: asked ${count} times`);
    });
  }
  
  return repeatedFields.length > 0;
}

async function main() {
  console.log('🧪 Testing Divorce Chat Flow');
  console.log('=============================\n');

  const conversationHistory = [];

  for (let i = 0; i < divorceConversation.length; i++) {
    const { message, expectedCategory, expectedFields } = divorceConversation[i];
    
    console.log(`\n--- Message ${i + 1} ---`);
    console.log(`👤 User: "${message}"`);

    const response = await sendMessage(message);

    if (!response) {
      console.log('❌ Failed to get response');
      continue;
    }

    console.log(`🤖 AI: "${response.reply}"`);
    console.log(`📋 Next Field: ${response.next_field || 'N/A'}`);
    console.log(`📊 Collected Answers:`, JSON.stringify(response.collected_answers, null, 2));
    
    // Track conversation history
    conversationHistory.push({
      userMessage: message,
      aiResponse: response.reply,
      fieldAsked: response.next_field,
      collectedFields: response.collected_answers
    });

    // Update collected answers
    Object.assign(collectedAnswers, response.collected_answers);

    // Check for category detection
    if (expectedCategory && response.debug?.mainCategory) {
      const matched = response.debug.mainCategory === expectedCategory;
      console.log(`   ${matched ? '✅' : '❌'} Category: ${response.debug.mainCategory} (expected: ${expectedCategory})`);
    }

    // Check for field extraction
    if (expectedFields && response.collected_answers) {
      const extractedFields = Object.keys(response.collected_answers);
      const matchedFields = expectedFields.filter(f => extractedFields.includes(f));
      const missingFields = expectedFields.filter(f => !extractedFields.includes(f));
      
      if (matchedFields.length > 0) {
        console.log(`   ✅ Extracted fields: ${matchedFields.join(', ')}`);
      }
      if (missingFields.length > 0) {
        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
      }
    }

    // Check for repeating fields
    if (i > 0) {
      checkForRepeatingFields(conversationHistory, response.next_field, Object.keys(collectedAnswers));
    }

    // Show debug info
    if (response.debug) {
      console.log(`\n🔍 Debug Info:`);
      console.log(`   - Stage: ${response.debug.stage}`);
      console.log(`   - Required Fields: ${response.debug.requiredFields?.join(', ') || 'N/A'}`);
      console.log(`   - Missing Fields: ${response.debug.missingFields?.join(', ') || 'None'}`);
      console.log(`   - Processing Time: ${response.debug.processingTime}ms`);
    }

    // Add small delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Final summary
  console.log(`\n\n📊 FINAL SUMMARY`);
  console.log('================');
  console.log(`\nTotal Messages: ${conversationHistory.length}`);
  console.log(`Session ID: ${sessionId}`);
  console.log(`\nFinal Collected Answers:`);
  console.log(JSON.stringify(collectedAnswers, null, 2));

  // Analyze for repeating questions
  console.log(`\n\n🔍 REPETITION ANALYSIS`);
  console.log('====================');
  
  const fieldOccurrences = {};
  conversationHistory.forEach((msg, index) => {
    if (msg.fieldAsked) {
      if (!fieldOccurrences[msg.fieldAsked]) {
        fieldOccurrences[msg.fieldAsked] = [];
      }
      fieldOccurrences[msg.fieldAsked].push(index + 1);
    }
  });

  const repeatedFields = Object.entries(fieldOccurrences)
    .filter(([_, indices]) => indices.length > 1);

  if (repeatedFields.length > 0) {
    console.log('\n❌ REPEATED QUESTIONS DETECTED:');
    repeatedFields.forEach(([field, indices]) => {
      console.log(`   - "${field}" asked on messages: ${indices.join(', ')}`);
    });
    
    // Check if repeated fields had values collected
    repeatedFields.forEach(([field, indices]) => {
      const value = collectedAnswers[field];
      if (value) {
        console.log(`   ⚠️  "${field}" has value "${value}" but was still asked again!`);
      }
    });
  } else {
    console.log('\n✅ No repeated questions detected');
  }

  console.log('\n✅ Test completed');
}

main().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

