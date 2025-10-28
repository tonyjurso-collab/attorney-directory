const fs = require('fs');
const path = require('path');

// Read the test data
const testDataPath = path.join(__dirname, '..', 'test-lead-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

// Define subcategories for each practice area
const subcategories = {
  personal_injury_law: "car accident",
  family_law: "divorce", 
  general: "other",
  criminal_law: "other",
  medical_malpractice: "other",
  defective_products: "other",
  defective_medical_devices: "other",
  dangerous_drugs: "other",
  bankruptcy: "other",
  employment: "other",
  immigration: "other",
  real_estate: "other",
  business_law: "other",
  intellectual_property_law: "other",
  wills_trusts_estates: "other",
  tax_law: "other",
  social_security_disability: "other",
  civil_rights_law: "other"
};

// TCPA text
const tcpaText = "By submitting this form, you consent to be contacted by attorneys and legal service providers via phone, text, or email regarding your legal matter.";

// Update each practice area
Object.keys(testData.practice_areas).forEach(practiceArea => {
  const config = testData.practice_areas[practiceArea];
  
  // Add sub_category and tcpa_text to sample_answers
  config.sample_answers.sub_category = subcategories[practiceArea];
  config.sample_answers.tcpa_text = tcpaText;
  
  console.log(`Updated ${practiceArea}: sub_category="${subcategories[practiceArea]}"`);
});

// Write the updated data back
fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));

console.log('\n✅ Test data updated successfully!');
console.log('Added sub_category and tcpa_text to all practice areas.');
