#!/usr/bin/env node

/**
 * Manual Lead Analysis Script
 * 
 * This script allows manual input of lead IDs from LeadProsper dashboard
 * and runs the comparison analysis to identify missing fields.
 * 
 * Usage: node scripts/manual-lead-analysis.js
 */

const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
config({ path: '.env.local' });

// Load practice areas config
const configPath = path.join(__dirname, '../chat/practice_areas_config.json');
const practiceAreasConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Universal fields that should always be present
const UNIVERSAL_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'city',
  'state',
  'zip_code',
  'ip_address',
  'user_agent',
  'landing_page_url',
  'jornaya_leadid',
  'trustedform_cert_url',
  'tcpa_text',
  'sub_category'
];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get practice area config
function getPracticeAreaConfig(practiceAreaKey) {
  return practiceAreasConfig.legal_practice_areas[practiceAreaKey];
}

// Function to get expected fields for a practice area
function getExpectedFields(practiceAreaKey) {
  const config = getPracticeAreaConfig(practiceAreaKey);
  if (!config) return UNIVERSAL_FIELDS;
  
  const expectedFields = [...UNIVERSAL_FIELDS];
  
  // Add practice-area-specific fields from chat_flow
  if (config.chat_flow) {
    config.chat_flow.forEach(flowItem => {
      if (!expectedFields.includes(flowItem.field)) {
        expectedFields.push(flowItem.field);
      }
    });
  }
  
  return expectedFields;
}

// Function to fetch lead from LeadProsper
async function fetchLeadFromLeadProsper(leadId) {
  const apiKey = process.env.LEADPROSPER_API_KEY;
  const apiUrl = process.env.LEADPROSPER_API_URL || 'https://api.leadprosper.io';
  
  if (!apiKey) {
    console.error('❌ LeadProsper API key not configured');
    return null;
  }
  
  try {
    console.log(`🔍 Fetching lead ${leadId} from LeadProsper...`);
    
    const response = await fetch(`${apiUrl}/leads/${leadId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AttorneyDirectory/2.0',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch lead: HTTP ${response.status}`);
      return null;
    }
    
    const leadData = await response.json();
    console.log(`✅ Successfully fetched lead ${leadId}`);
    return leadData;
    
  } catch (error) {
    console.error(`❌ Error fetching lead ${leadId}:`, error.message);
    return null;
  }
}

// Function to analyze lead data
function analyzeLeadData(leadData, practiceAreaKey) {
  const expectedFields = getExpectedFields(practiceAreaKey);
  const actualFields = Object.keys(leadData.fields || {});
  
  const missingFields = expectedFields.filter(field => !actualFields.includes(field));
  const extraFields = actualFields.filter(field => !expectedFields.includes(field));
  
  return {
    practiceAreaKey,
    leadId: leadData.id,
    status: leadData.status,
    campaignId: leadData.campaign_id,
    expectedFields,
    actualFields,
    missingFields,
    extraFields,
    fieldCount: actualFields.length,
    expectedCount: expectedFields.length
  };
}

// Function to prompt for lead ID
function promptForLeadId(practiceArea) {
  return new Promise((resolve) => {
    rl.question(`Enter LeadProsper Lead ID for ${practiceArea}: `, (leadId) => {
      resolve(leadId.trim());
    });
  });
}

// Main function
async function main() {
  console.log('🔍 Manual Lead Analysis Tool');
  console.log('============================');
  console.log('This tool will help you analyze leads from LeadProsper dashboard.');
  console.log('You can enter lead IDs manually and we\'ll analyze the field completeness.\n');
  
  const practiceAreas = Object.keys(practiceAreasConfig.legal_practice_areas);
  const results = [];
  
  for (const practiceArea of practiceAreas) {
    console.log(`\n📋 Practice Area: ${practiceArea}`);
    console.log(`   Name: ${practiceAreasConfig.legal_practice_areas[practiceArea].name}`);
    
    const leadId = await promptForLeadId(practiceArea);
    
    if (!leadId) {
      console.log('⏭️  Skipping - no lead ID provided');
      continue;
    }
    
    const leadData = await fetchLeadFromLeadProsper(leadId);
    
    if (leadData) {
      const analysis = analyzeLeadData(leadData, practiceArea);
      results.push(analysis);
      
      console.log(`\n📊 Analysis for ${practiceArea}:`);
      console.log(`   Lead ID: ${analysis.leadId}`);
      console.log(`   Status: ${analysis.status}`);
      console.log(`   Campaign ID: ${analysis.campaignId}`);
      console.log(`   Fields Present: ${analysis.fieldCount}/${analysis.expectedCount}`);
      
      if (analysis.missingFields.length > 0) {
        console.log(`   ❌ Missing Fields (${analysis.missingFields.length}): ${analysis.missingFields.join(', ')}`);
      } else {
        console.log(`   ✅ All expected fields present`);
      }
      
      if (analysis.extraFields.length > 0) {
        console.log(`   ℹ️  Extra Fields (${analysis.extraFields.length}): ${analysis.extraFields.join(', ')}`);
      }
    }
    
    // Ask if user wants to continue
    const continueAnswer = await new Promise((resolve) => {
      rl.question('\nContinue to next practice area? (y/n): ', (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
    
    if (!continueAnswer) {
      break;
    }
  }
  
  // Generate summary report
  if (results.length > 0) {
    console.log('\n📊 SUMMARY REPORT');
    console.log('=================');
    
    results.forEach(result => {
      console.log(`\n${result.practiceAreaKey}:`);
      console.log(`  Lead ID: ${result.leadId}`);
      console.log(`  Fields: ${result.fieldCount}/${result.expectedCount}`);
      console.log(`  Missing: ${result.missingFields.length > 0 ? result.missingFields.join(', ') : 'None'}`);
    });
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `manual-analysis-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);
  }
  
  rl.close();
}

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  rl.close();
  process.exit(1);
});
