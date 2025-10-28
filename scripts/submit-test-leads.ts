const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
config({ path: '.env.local' });

/**
 * Automated script to submit test leads for all practice areas
 * This script will:
 * 1. Read test data from test-lead-data.json
 * 2. Submit leads for each practice area via API
 * 3. Record the results (lead_id, status, errors)
 * 4. Save results to submission-results.json
 */

/**
 * @typedef {Object} TestLeadData
 * @property {Object} practice_areas
 */

/**
 * @typedef {Object} SubmissionResult
 * @property {string} [lead_id]
 * @property {string} status
 * @property {number} [code]
 * @property {string} [message]
 * @property {string} timestamp
 * @property {string} [error]
 */

/**
 * @typedef {Object} SubmissionResults
 */

async function submitTestLeads() {
  console.log('🚀 Starting automated lead submission test...\n');

  // Read test data
  const testDataPath = path.join(__dirname, '..', 'test-lead-data.json');
  if (!fs.existsSync(testDataPath)) {
    console.error('❌ test-lead-data.json not found. Please run generate-test-lead-data.ts first.');
    process.exit(1);
  }

  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  const results = {};

  // Get all practice areas
  const practiceAreas = Object.keys(testData.practice_areas);
  console.log(`📋 Found ${practiceAreas.length} practice areas to test:\n`);

  for (const practiceArea of practiceAreas) {
    const config = testData.practice_areas[practiceArea];
    console.log(`\n🔄 Testing: ${config.name} (${practiceArea})`);
    console.log(`   Campaign ID: ${config.campaign_id}`);
    console.log(`   Expected Fields: ${config.chat_flow_fields.length}`);

    try {
      // Create a mock session with the test data
      const mockSession = {
        sid: `test-${practiceArea}-${Date.now()}`,
        practice_area: practiceArea,
        answers: config.sample_answers,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'completed',
        user_ip: '127.0.0.1',
        user_agent: 'Test Script',
        landing_page_url: 'https://test.com',
        jornaya_leadid: 'test-jornaya-id',
        trustedform_cert_url: 'https://test-trustedform.com',
        tcpa_text: 'Test TCPA text'
      };

      // Submit via API endpoint
      console.log('   📤 Submitting lead via API...');
      const response = await fetch('http://localhost:3000/api/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: practiceArea,
          ...config.sample_answers
        })
      });

      const result = await response.json();
      
      // Debug: Log the full response
      console.log('   🔍 API Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log(`   ✅ SUCCESS - Lead ID: ${result.lead_id}`);
        results[practiceArea] = {
          lead_id: result.lead_id,
          status: 'ACCEPTED',
          code: 0,
          message: 'Lead submitted successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        console.log(`   ❌ FAILED - ${result.error}`);
        results[practiceArea] = {
          status: 'ERROR',
          code: 1,
          message: result.error || 'Unknown error',
          timestamp: new Date().toISOString(),
          error: result.error
        };
      }

    } catch (error) {
      console.log(`   💥 EXCEPTION - ${error.message}`);
      results[practiceArea] = {
        status: 'ERROR',
        code: 1,
        message: error.message,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    // Add a small delay between submissions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  const resultsPath = path.join(__dirname, '..', 'submission-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log('\n📊 SUBMISSION SUMMARY:');
  console.log('====================');
  
  const successful = Object.values(results).filter(r => r.status === 'ACCEPTED').length;
  const failed = Object.values(results).filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Results saved to: ${resultsPath}`);

  // Show failed submissions
  if (failed > 0) {
    console.log('\n❌ FAILED SUBMISSIONS:');
    Object.entries(results).forEach(([practiceArea, result]) => {
      if (result.status === 'ERROR') {
        console.log(`   ${practiceArea}: ${result.message}`);
      }
    });
  }

  // Show successful submissions
  if (successful > 0) {
    console.log('\n✅ SUCCESSFUL SUBMISSIONS:');
    Object.entries(results).forEach(([practiceArea, result]) => {
      if (result.status === 'ACCEPTED') {
        console.log(`   ${practiceArea}: ${result.lead_id}`);
      }
    });
  }

  console.log('\n🎯 Next step: Run comparison script to verify fields in LeadProsper');
  console.log('   node scripts/compare-leadprosper-fields.ts submission-results.json');
}

// Run the script
if (require.main === module) {
  submitTestLeads().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { submitTestLeads };
