// Test the required fields loading directly
const testRequiredFields = () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const configPath = path.join(process.cwd(), 'lib', 'practice_areas_config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    
    console.log('Testing required fields loading...\n');
    
    // Test family law
    const familyLaw = config.legal_practice_areas.family_law;
    console.log('Family Law Required Fields:');
    for (const [fieldName, fieldConfig] of Object.entries(familyLaw.required_fields)) {
      if (typeof fieldConfig === 'object' && fieldConfig.required === true) {
        if (fieldConfig.source !== 'server' && fieldConfig.source !== 'config') {
          console.log(`- ${fieldName}: ${fieldConfig.type}`);
        }
      }
    }
    
    console.log('\nPersonal Injury Law Required Fields:');
    const personalInjury = config.legal_practice_areas.personal_injury_law;
    for (const [fieldName, fieldConfig] of Object.entries(personalInjury.required_fields)) {
      if (typeof fieldConfig === 'object' && fieldConfig.required === true) {
        if (fieldConfig.source !== 'server' && fieldConfig.source !== 'config') {
          console.log(`- ${fieldName}: ${fieldConfig.type}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testRequiredFields();
