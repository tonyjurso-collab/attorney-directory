#!/usr/bin/env node

/**
 * LeadProsper Lead Verification Script
 * 
 * This script fetches a lead from LeadProsper API using the lead_id
 * and displays all fields that were submitted to verify the implementation.
 * 
 * Usage: node scripts/verify-leadprosper-lead.ts <lead_id>
 * Example: node scripts/verify-leadprosper-lead.ts b59OMX4B8J-QmL7XJ211
 */

const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// SSDI-specific fields that should be present
const SSDI_FIELDS = [
  'doctor_treatment',
  'currently_receiving_benefits',
  'have_worked',
  'out_of_work',
  'age',
  'has_attorney'
];

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
  'trustedform_cert_url'
];

async function fetchLeadFromLeadProsper(leadId, maxRetries = 5) {
  const apiKey = process.env.LEADPROSPER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ LEADPROSPER_API_KEY not found in environment variables');
    process.exit(1);
  }

  const apiUrl = process.env.LEADPROSPER_API_URL || 'https://api.leadprosper.io';
  const url = `${apiUrl}/public/lead/${leadId}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}: Fetching lead ${leadId}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'AttorneyDirectory/2.0',
        },
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Lead fetched successfully on attempt ${attempt}`);
        return data;
      } else if (response.status === 404) {
        console.log(`⏳ Lead not found yet (404) - attempt ${attempt}/${maxRetries}`);
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s, 6s, 8s delays
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}: ${errorText}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Network error on attempt ${attempt}:`, error);
      if (attempt < maxRetries) {
        const delay = attempt * 2000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`❌ Failed to fetch lead after ${maxRetries} attempts`);
  return null;
}

function analyzeLeadData(leadData) {
  console.log('\n=== LEAD ANALYSIS ===');
  console.log(`Lead ID: ${leadData.id}`);
  console.log(`Status: ${leadData.status}`);
  console.log(`Campaign: ${leadData.campaign_name} (ID: ${leadData.campaign_id})`);
  console.log(`Test Lead: ${leadData.test ? 'Yes' : 'No'}`);
  console.log(`Cost: $${leadData.cost}`);
  console.log(`Revenue: $${leadData.revenue}`);

  console.log('\n=== SUPPLIER INFO ===');
  console.log(`Supplier: ${leadData.supplier.name} (ID: ${leadData.supplier.id})`);
  console.log(`Client: ${leadData.supplier.client.name} (ID: ${leadData.supplier.client.id})`);

  console.log('\n=== BUYERS INFO ===');
  leadData.buyers.forEach((buyer, index) => {
    console.log(`Buyer ${index + 1}: ${buyer.name} - Status: ${buyer.status} - Price: $${buyer.sell_price}`);
    if (buyer.error_message) {
      console.log(`  Error: ${buyer.error_message}`);
    }
  });

  console.log('\n=== LEAD DATA FIELDS ===');
  const fields = leadData.lead_data;
  const fieldKeys = Object.keys(fields).sort();
  
  console.log(`Total fields submitted: ${fieldKeys.length}`);
  console.log('\nAll submitted fields:');
  fieldKeys.forEach(key => {
    const value = fields[key];
    console.log(`  ${key}: ${value}`);
  });

  console.log('\n=== FIELD VALIDATION ===');
  
  // Check universal fields
  console.log('\nUniversal Fields Check:');
  UNIVERSAL_FIELDS.forEach(field => {
    const hasField = fields.hasOwnProperty(field);
    const value = fields[field];
    console.log(`  ${field}: ${hasField ? '✅ PRESENT' : '❌ MISSING'} (value: ${value || 'N/A'})`);
  });

  // Check SSDI fields
  console.log('\nSSDI-Specific Fields Check:');
  SSDI_FIELDS.forEach(field => {
    const hasField = fields.hasOwnProperty(field);
    const value = fields[field];
    console.log(`  ${field}: ${hasField ? '✅ PRESENT' : '❌ MISSING'} (value: ${value || 'N/A'})`);
  });

  // Summary
  const missingUniversal = UNIVERSAL_FIELDS.filter(field => !fields.hasOwnProperty(field));
  const missingSSDI = SSDI_FIELDS.filter(field => !fields.hasOwnProperty(field));
  
  console.log('\n=== SUMMARY ===');
  if (missingUniversal.length === 0 && missingSSDI.length === 0) {
    console.log('✅ All required fields are present!');
  } else {
    if (missingUniversal.length > 0) {
      console.log(`❌ Missing universal fields: ${missingUniversal.join(', ')}`);
    }
    if (missingSSDI.length > 0) {
      console.log(`❌ Missing SSDI fields: ${missingSSDI.join(', ')}`);
    }
  }
}

async function main() {
  const leadId = process.argv[2];
  
  if (!leadId) {
    console.error('❌ Usage: node scripts/verify-leadprosper-lead.ts <lead_id>');
    console.error('Example: node scripts/verify-leadprosper-lead.ts b59OMX4B8J-QmL7XJ211');
    process.exit(1);
  }

  console.log(`🔍 Verifying LeadProsper lead: ${leadId}`);
  console.log(`🌐 API URL: ${process.env.LEADPROSPER_API_URL || 'https://api.leadprosper.io'}`);
  console.log(`🔑 API Key: ${process.env.LEADPROSPER_API_KEY ? '***SET***' : 'NOT SET'}`);

  const leadData = await fetchLeadFromLeadProsper(leadId);
  
  if (leadData) {
    analyzeLeadData(leadData);
  } else {
    console.error('❌ Could not fetch lead data');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
}