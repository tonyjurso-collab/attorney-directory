#!/usr/bin/env node

/**
 * Divorce Repeating Questions Test
 * 
 * This script tests to reproduce the repeating questions issue
 * 
 * Usage: node scripts/test-divorce-repeating-issue.js
 */

const { config } = require('dotenv');
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

let sessionId = null;
const conversationHistory = [];

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
    }

    return data;
  } catch (error) {
    console.error(`Error sending message:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🧪 Testing Divorce Flow for Repeating Questions');
  console.log('================================================\n');

  // Simulate a user providing incomplete information multiple times
  const testMessages = [
    "I need help with a divorce",
    "Sarah",  // Only first name
    "Johnson",  // Only last name
    "sarah@example.com",  // Only email
    "555-123-4567",  // Only phone
    "60601",  // Only zip
    "No",  // has_attorney
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    
    console.log(`\n--- Turn ${i + 1} ---`);
    console.log(`👤 User: "${message}"`);

    const response = await sendMessage(message);

    if (!response) {
      console.log('❌ Failed to get response');
      continue;
    }

    console.log(`🤖 AI: "${response.reply}"`);
    console.log(`📋 Next Field: ${response.next_field || 'N/A'}`);
    
    // Track conversation
    conversationHistory.push({
      turn: i + 1,
      userMessage: message,
      aiResponse: response.reply,
      fieldAsked: response.next_field,
      collectedAnswers: response.collected_answers,
      missingFields: response.debug?.missingFields || [],
      requiredFields: response.debug?.requiredFields || []
    });

    // Check for repeating questions
    const previousAsks = conversationHistory
      .slice(0, -1)
      .filter(h => h.fieldAsked === response.next_field)
      .map(h => h.turn);
    
    if (previousAsks.length > 0) {
      console.log(`\n❌ REPEATED QUESTION DETECTED!`);
      console.log(`   Field "${response.next_field}" was previously asked on turns: ${previousAsks.join(', ')}`);
      
      // Check if we have a value for this field
      const value = response.collected_answers?.[response.next_field];
      if (value) {
        console.log(`   ⚠️  The field "${response.next_field}" has value "${value}" but is being asked again!`);
      }
    }

    console.log(`📊 Collected:`, Object.keys(response.collected_answers || {}).join(', '));
    console.log(`⏩ Missing:`, response.debug?.missingFields?.join(', ') || 'None');

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Final analysis
  console.log(`\n\n📊 REPETITION ANALYSIS`);
  console.log('====================\n');

  const fieldFrequency = {};
  conversationHistory.forEach(h => {
    if (h.fieldAsked) {
      fieldFrequency[h.fieldAsked] = fieldFrequency[h.fieldAsked] || [];
      fieldFrequency[h.fieldAsked].push({
        turn: h.turn,
        userMessage: h.userMessage,
        hadValue: h.collectedAnswers[h.fieldAsked] || null
      });
    }
  });

  const repeatedFields = Object.entries(fieldFrequency)
    .filter(([_, occurrences]) => occurrences.length > 1);

  if (repeatedFields.length > 0) {
    console.log('❌ REPEATED FIELDS DETECTED:\n');
    repeatedFields.forEach(([field, occurrences]) => {
      console.log(`Field: "${field}"`);
      console.log(`  Asked ${occurrences.length} times:`);
      occurrences.forEach(({ turn, userMessage, hadValue }) => {
        console.log(`    Turn ${turn}: User said "${userMessage.substring(0, 30)}..."`);
        if (hadValue) {
          console.log(`      ⚠️  Had value "${hadValue}" when asked again!`);
        }
      });
      console.log('');
    });
  } else {
    console.log('✅ No repeated fields detected');
  }

  // Show the complete flow
  console.log('\n\n📋 COMPLETE CONVERSATION FLOW');
  console.log('============================\n');
  conversationHistory.forEach((h, idx) => {
    console.log(`Turn ${h.turn}:`);
    console.log(`  User: "${h.userMessage}"`);
    console.log(`  AI: "${h.aiResponse.substring(0, 80)}..."`);
    console.log(`  Asked for field: ${h.fieldAsked || 'N/A'}`);
    console.log('');
  });

  console.log('\n✅ Test completed');
}

main().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

