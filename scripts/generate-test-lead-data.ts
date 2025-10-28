#!/usr/bin/env node

/**
 * Generate Test Lead Data for All Practice Areas
 * 
 * This script reads all practice areas from the config and generates
 * sample test data for each practice area based on their chat_flow.
 * 
 * Usage: node scripts/generate-test-lead-data.ts
 * Output: test-lead-data.json
 */

const fs = require('fs');
const path = require('path');

// Load practice areas config
const configPath = path.join(__dirname, '../chat/practice_areas_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Sample data generators for different field types
const sampleData = {
  first_name: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Ashley'],
  last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
  email: ['test@example.com', 'user@test.com', 'sample@demo.com', 'lead@test.com', 'client@example.com'],
  phone: ['5551234567', '5559876543', '5554567890', '5553210987', '5556543210'],
  city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  state: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'],
  zip_code: ['10001', '90210', '60601', '77001', '85001', '19101', '78201', '92101', '75201', '95101'],
  describe: [
    'I was injured in a car accident and need legal help',
    'I need help with a family law matter',
    'I have a criminal case that needs attention',
    'I believe I have a medical malpractice case',
    'I was injured by a defective product',
    'I need help with bankruptcy proceedings',
    'I have an employment law issue',
    'I need immigration assistance',
    'I have a real estate legal matter',
    'I need business law consultation'
  ],
  // SSDI specific fields
  doctor_treatment: ['Yes', 'No'],
  currently_receiving_benefits: ['yes', 'no'],
  have_worked: ['yes', 'no'],
  out_of_work: ['yes', 'no'],
  age: [25, 35, 45, 55, 65, 75],
  // Personal injury specific fields
  bodily_injury: ['yes', 'no'],
  at_fault: ['no', 'yes'],
  date_of_incident: ['01/15/2024', '02/20/2024', '03/10/2024', '04/05/2024', '05/12/2024'],
  // Family law specific fields
  children_involved: ['yes', 'no'],
  // General fields
  has_attorney: ['no', 'yes'],
  // Medical malpractice specific
  medical_condition: ['heart attack', 'stroke', 'cancer', 'infection', 'surgical error'],
  // Employment specific
  employment_status: ['employed', 'unemployed', 'self-employed', 'retired'],
  // Immigration specific
  immigration_status: ['citizen', 'permanent resident', 'visa holder', 'undocumented'],
  // Real estate specific
  property_type: ['residential', 'commercial', 'rental', 'vacation home'],
  // Business law specific
  business_type: ['corporation', 'LLC', 'partnership', 'sole proprietorship'],
  // IP law specific
  ip_type: ['patent', 'trademark', 'copyright', 'trade secret'],
  // Estate planning specific
  estate_value: ['under 100k', '100k-500k', '500k-1m', 'over 1m'],
  // Tax law specific
  tax_issue: ['audit', 'back taxes', 'penalties', 'planning'],
  // Civil rights specific
  civil_rights_violation: ['discrimination', 'police misconduct', 'voting rights', 'free speech']
};

function getRandomValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTestDataForPracticeArea(practiceAreaKey, practiceAreaConfig) {
  const testData = {
    practice_area: practiceAreaKey,
    name: practiceAreaConfig.name,
    campaign_id: practiceAreaConfig.lead_prosper_config?.lp_campaign_id,
    supplier_id: practiceAreaConfig.lead_prosper_config?.lp_supplier_id,
    chat_flow_fields: [],
    sample_answers: {}
  };

  // Extract fields from chat_flow
  if (practiceAreaConfig.chat_flow) {
    practiceAreaConfig.chat_flow.forEach(flowItem => {
      const fieldName = flowItem.field;
      testData.chat_flow_fields.push(fieldName);
      
      // Generate sample data for this field
      if (sampleData[fieldName]) {
        testData.sample_answers[fieldName] = getRandomValue(sampleData[fieldName]);
      } else {
        // Fallback for unknown fields
        testData.sample_answers[fieldName] = `Sample ${fieldName}`;
      }
    });
  }

  // Add universal fields that should always be present
  const universalFields = ['first_name', 'last_name', 'email', 'phone', 'city', 'state', 'zip_code'];
  universalFields.forEach(field => {
    if (!testData.sample_answers[field]) {
      testData.sample_answers[field] = getRandomValue(sampleData[field]);
    }
  });

  // Add system fields
  testData.sample_answers.ip_address = '127.0.0.1';
  testData.sample_answers.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  testData.sample_answers.landing_page_url = `https://example.com/${practiceAreaKey}`;
  testData.sample_answers.jornaya_leadid = `jornaya_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  testData.sample_answers.trustedform_cert_url = `https://cert.trustedform.com/test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return testData;
}

function generateAllTestData() {
  console.log('🔧 Generating test data for all practice areas...\n');
  
  const allTestData = {
    generated_at: new Date().toISOString(),
    total_practice_areas: 0,
    practice_areas: {}
  };

  const practiceAreas = config.legal_practice_areas;
  
  Object.keys(practiceAreas).forEach(practiceAreaKey => {
    const practiceAreaConfig = practiceAreas[practiceAreaKey];
    
    // Skip if no LeadProsper config
    if (!practiceAreaConfig.lead_prosper_config) {
      console.log(`⏭️  Skipping ${practiceAreaKey} - no LeadProsper config`);
      return;
    }

    console.log(`📝 Generating test data for: ${practiceAreaKey}`);
    console.log(`   Name: ${practiceAreaConfig.name}`);
    console.log(`   Campaign ID: ${practiceAreaConfig.lead_prosper_config.lp_campaign_id}`);
    console.log(`   Chat Flow Fields: ${practiceAreaConfig.chat_flow?.length || 0}`);
    
    const testData = generateTestDataForPracticeArea(practiceAreaKey, practiceAreaConfig);
    allTestData.practice_areas[practiceAreaKey] = testData;
    allTestData.total_practice_areas++;
    
    console.log(`   Generated ${Object.keys(testData.sample_answers).length} sample fields\n`);
  });

  return allTestData;
}

function saveTestData(testData) {
  const outputPath = path.join(__dirname, '../test-lead-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
  console.log(`💾 Test data saved to: ${outputPath}`);
}

function displaySummary(testData) {
  console.log('\n📊 GENERATION SUMMARY');
  console.log('====================');
  console.log(`Total Practice Areas: ${testData.total_practice_areas}`);
  console.log(`Generated At: ${testData.generated_at}`);
  
  console.log('\nPractice Areas Generated:');
  Object.keys(testData.practice_areas).forEach((key, index) => {
    const area = testData.practice_areas[key];
    console.log(`${index + 1}. ${key}`);
    console.log(`   Fields: ${area.chat_flow_fields.length}`);
    console.log(`   Campaign: ${area.campaign_id}`);
  });
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review the generated test data in test-lead-data.json');
  console.log('2. Submit test leads for each practice area via the chatbot');
  console.log('3. Record the lead_ids from LeadProsper responses');
  console.log('4. Run the comparison script to verify field completeness');
}

// Main execution
if (require.main === module) {
  try {
    const testData = generateAllTestData();
    saveTestData(testData);
    displaySummary(testData);
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}
