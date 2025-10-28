#!/usr/bin/env node

/**
 * Compare LeadProsper Fields Script
 * 
 * This script takes submission results and compares expected fields vs actual fields
 * in LeadProsper for multiple leads across all practice areas.
 * 
 * Usage: node scripts/compare-leadprosper-fields.ts <submission-results.json>
 * Example: node scripts/compare-leadprosper-fields.ts submission-results.json
 */

const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

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
  'trustedform_cert_url'
];

async function fetchLeadFromLeadProsper(leadId, maxRetries = 3) {
  const apiKey = process.env.LEADPROSPER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ LEADPROSPER_API_KEY not found in environment variables');
    return null;
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

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Lead fetched successfully on attempt ${attempt}`);
        return data;
      } else if (response.status === 404) {
        console.log(`⏳ Lead not found yet (404) - attempt ${attempt}/${maxRetries}`);
        if (attempt < maxRetries) {
          const delay = attempt * 2000;
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

function getExpectedFieldsForPracticeArea(practiceAreaKey) {
  const practiceArea = practiceAreasConfig.legal_practice_areas[practiceAreaKey];
  if (!practiceArea || !practiceArea.chat_flow) {
    return [];
  }

  return practiceArea.chat_flow.map(flowItem => flowItem.field);
}

function analyzeLeadComparison(practiceAreaKey, leadData, expectedFields) {
  const actualFields = leadData.lead_data || {};
  const actualFieldKeys = Object.keys(actualFields);
  
  const presentFields = expectedFields.filter(field => actualFields.hasOwnProperty(field));
  const missingFields = expectedFields.filter(field => !actualFields.hasOwnProperty(field));
  
  const presentUniversal = UNIVERSAL_FIELDS.filter(field => actualFields.hasOwnProperty(field));
  const missingUniversal = UNIVERSAL_FIELDS.filter(field => !actualFields.hasOwnProperty(field));
  
  const practiceAreaSpecificFields = expectedFields.filter(field => !UNIVERSAL_FIELDS.includes(field));
  const presentPracticeArea = practiceAreaSpecificFields.filter(field => actualFields.hasOwnProperty(field));
  const missingPracticeArea = practiceAreaSpecificFields.filter(field => !actualFields.hasOwnProperty(field));

  return {
    practiceAreaKey,
    leadId: leadData.id,
    status: leadData.status,
    campaignId: leadData.campaign_id,
    campaignName: leadData.campaign_name,
    testLead: leadData.test,
    cost: leadData.cost,
    revenue: leadData.revenue,
    
    // Field analysis
    expectedFields: expectedFields.length,
    actualFields: actualFieldKeys.length,
    presentFields: presentFields.length,
    missingFields: missingFields.length,
    
    // Universal fields
    universalExpected: UNIVERSAL_FIELDS.length,
    universalPresent: presentUniversal.length,
    universalMissing: missingUniversal.length,
    missingUniversalFields: missingUniversal,
    
    // Practice area specific fields
    practiceAreaExpected: practiceAreaSpecificFields.length,
    practiceAreaPresent: presentPracticeArea.length,
    practiceAreaMissing: missingPracticeArea.length,
    missingPracticeAreaFields: missingPracticeArea,
    
    // Detailed field data
    allExpectedFields: expectedFields,
    allPresentFields: presentFields,
    allMissingFields: missingFields,
    actualFieldValues: actualFields
  };
}

function generateMarkdownReport(comparisons) {
  let report = '# Lead Type Field Comparison Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Summary table
  report += '## Summary\n\n';
  report += '| Practice Area | Status | Expected | Present | Missing | Universal OK | Practice Area OK |\n';
  report += '|---------------|--------|----------|---------|---------|--------------|------------------|\n';
  
  comparisons.forEach(comp => {
    const universalOk = comp.universalMissing === 0 ? '✅' : '❌';
    const practiceAreaOk = comp.practiceAreaMissing === 0 ? '✅' : '❌';
    report += `| ${comp.practiceAreaKey} | ${comp.status} | ${comp.expectedFields} | ${comp.presentFields} | ${comp.missingFields} | ${universalOk} | ${practiceAreaOk} |\n`;
  });
  
  report += '\n## Detailed Analysis\n\n';
  
  comparisons.forEach(comp => {
    report += `### ${comp.practiceAreaKey}\n\n`;
    report += `- **Lead ID**: ${comp.leadId}\n`;
    report += `- **Status**: ${comp.status}\n`;
    report += `- **Campaign**: ${comp.campaignName} (ID: ${comp.campaignId})\n`;
    report += `- **Test Lead**: ${comp.testLead ? 'Yes' : 'No'}\n`;
    report += `- **Cost**: $${comp.cost}\n`;
    report += `- **Revenue**: $${comp.revenue}\n\n`;
    
    report += `#### Field Analysis\n`;
    report += `- **Expected Fields**: ${comp.expectedFields}\n`;
    report += `- **Present Fields**: ${comp.presentFields}\n`;
    report += `- **Missing Fields**: ${comp.missingFields}\n\n`;
    
    if (comp.universalMissing > 0) {
      report += `#### Universal Fields Issues\n`;
      report += `- **Missing Universal Fields**: ${comp.missingUniversalFields.join(', ')}\n\n`;
    }
    
    if (comp.practiceAreaMissing > 0) {
      report += `#### Practice Area Specific Issues\n`;
      report += `- **Missing Practice Area Fields**: ${comp.missingPracticeAreaFields.join(', ')}\n\n`;
    }
    
    if (comp.missingFields === 0) {
      report += `✅ **All fields present!**\n\n`;
    } else {
      report += `❌ **Missing ${comp.missingFields} fields**\n\n`;
    }
    
    report += `#### All Submitted Fields\n`;
    Object.keys(comp.actualFieldValues).sort().forEach(field => {
      const value = comp.actualFieldValues[field];
      report += `- \`${field}\`: ${value}\n`;
    });
    
    report += '\n---\n\n';
  });
  
  return report;
}

function generateConsoleReport(comparisons) {
  console.log('\n📊 COMPARISON SUMMARY');
  console.log('====================');
  
  comparisons.forEach(comp => {
    const universalOk = comp.universalMissing === 0 ? '✅' : '❌';
    const practiceAreaOk = comp.practiceAreaMissing === 0 ? '✅' : '❌';
    
    console.log(`\n${comp.practiceAreaKey}:`);
    console.log(`  Status: ${comp.status}`);
    console.log(`  Expected: ${comp.expectedFields}, Present: ${comp.presentFields}, Missing: ${comp.missingFields}`);
    console.log(`  Universal Fields: ${universalOk} (${comp.universalPresent}/${comp.universalExpected})`);
    console.log(`  Practice Area Fields: ${practiceAreaOk} (${comp.practiceAreaPresent}/${comp.practiceAreaExpected})`);
    
    if (comp.missingUniversalFields.length > 0) {
      console.log(`  Missing Universal: ${comp.missingUniversalFields.join(', ')}`);
    }
    if (comp.missingPracticeAreaFields.length > 0) {
      console.log(`  Missing Practice Area: ${comp.missingPracticeAreaFields.join(', ')}`);
    }
  });
  
  // Overall summary
  const totalExpected = comparisons.reduce((sum, comp) => sum + comp.expectedFields, 0);
  const totalPresent = comparisons.reduce((sum, comp) => sum + comp.presentFields, 0);
  const totalMissing = comparisons.reduce((sum, comp) => sum + comp.missingFields, 0);
  
  console.log('\n📈 OVERALL SUMMARY');
  console.log('=================');
  console.log(`Total Practice Areas: ${comparisons.length}`);
  console.log(`Total Expected Fields: ${totalExpected}`);
  console.log(`Total Present Fields: ${totalPresent}`);
  console.log(`Total Missing Fields: ${totalMissing}`);
  console.log(`Success Rate: ${((totalPresent / totalExpected) * 100).toFixed(1)}%`);
}

async function main() {
  const submissionResultsPath = process.argv[2];
  
  if (!submissionResultsPath) {
    console.error('❌ Usage: node scripts/compare-leadprosper-fields.ts <submission-results.json>');
    console.error('Example: node scripts/compare-leadprosper-fields.ts submission-results.json');
    process.exit(1);
  }

  if (!fs.existsSync(submissionResultsPath)) {
    console.error(`❌ File not found: ${submissionResultsPath}`);
    process.exit(1);
  }

  console.log(`🔍 Loading submission results from: ${submissionResultsPath}`);
  const submissionResults = JSON.parse(fs.readFileSync(submissionResultsPath, 'utf8'));
  
  console.log(`📊 Found ${Object.keys(submissionResults).length} practice areas to analyze\n`);

  const comparisons = [];

  for (const [practiceAreaKey, result] of Object.entries(submissionResults)) {
    console.log(`\n🔍 Analyzing ${practiceAreaKey}...`);
    
    if (!result.lead_id) {
      console.log(`⏭️  Skipping ${practiceAreaKey} - no lead_id`);
      continue;
    }

    const expectedFields = getExpectedFieldsForPracticeArea(practiceAreaKey);
    console.log(`📋 Expected fields: ${expectedFields.length}`);
    
    const leadData = await fetchLeadFromLeadProsper(result.lead_id);
    
    if (leadData) {
      const comparison = analyzeLeadComparison(practiceAreaKey, leadData, expectedFields);
      comparisons.push(comparison);
      console.log(`✅ Analysis complete for ${practiceAreaKey}`);
    } else {
      console.log(`❌ Failed to fetch lead data for ${practiceAreaKey}`);
    }
  }

  if (comparisons.length === 0) {
    console.log('❌ No comparisons generated');
    process.exit(1);
  }

  // Generate reports
  generateConsoleReport(comparisons);
  
  const markdownReport = generateMarkdownReport(comparisons);
  const reportPath = path.join(__dirname, '../lead-comparison-report.md');
  fs.writeFileSync(reportPath, markdownReport);
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  // Save JSON results
  const jsonPath = path.join(__dirname, '../lead-comparison-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(comparisons, null, 2));
  console.log(`💾 JSON results saved to: ${jsonPath}`);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
}
