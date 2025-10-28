import { getPracticeAreaConfig, getRequiredFields } from '../config/practice-areas-loader';
import { validateLeadData } from '../config/schemas';

// Lead data interface
export interface LeadData {
  lp_campaign_id: number;
  lp_supplier_id: number;
  lp_key: string;
  main_category: string;
  sub_category?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip_code: string;
  describe: string;
  // Optional fields
  date_of_incident?: string;
  bodily_injury?: string;
  at_fault?: string;
  has_attorney?: string;
  children_involved?: string;
  // Tracking fields
  ip_address?: string;
  user_agent?: string;
  landing_page_url?: string;
  jornaya_leadid?: string;
  trustedform_cert_url?: string;
  tcpa_text?: string;
  // Additional optional fields
  date_of_birth?: string;
  gender?: string;
  address?: string;
}

// Lead generation result
export interface LeadGenerationResult {
  success: boolean;
  leadData?: LeadData;
  errors?: Record<string, string>;
  warnings?: string[];
}

/**
 * Generate LeadProsper submission data
 */
export function generateLeadData(
  category: string,
  collectedData: Record<string, any>,
  serverData?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
  }
): LeadGenerationResult {
  const startTime = Date.now();
  
  try {
    const areaConfig = getPracticeAreaConfig(category);
    
    if (!areaConfig || !areaConfig.lead_prosper_config) {
      return {
        success: false,
        errors: { general: `LeadProsper configuration not available for ${category}` },
      };
    }
    
    const leadData: Partial<LeadData> = {};
    const requiredFields = getRequiredFields(category);
    const warnings: string[] = [];
    
    // Add LeadProsper configuration
    const lpConfig = areaConfig.lead_prosper_config;
    leadData.lp_campaign_id = lpConfig.lp_campaign_id;
    leadData.lp_supplier_id = lpConfig.lp_supplier_id;
    leadData.lp_key = lpConfig.lp_key;
    
    // Process each required field
    for (const [field, fieldConfig] of Object.entries(requiredFields)) {
      if (fieldConfig.source) {
        // Handle special source fields
        switch (fieldConfig.source) {
          case 'config':
            leadData[field as keyof LeadData] = fieldConfig.value;
            break;
          case 'server':
            leadData[field as keyof LeadData] = getServerValue(field, serverData);
            break;
        }
      } else if (collectedData[field] !== undefined) {
        const value = collectedData[field];
        
        // Format according to field requirements
        const formattedValue = formatForSubmission(field, value, fieldConfig, category);
        leadData[field as keyof LeadData] = formattedValue;
        
        // Log formatting if value changed
        if (formattedValue !== value) {
          console.log(`✅ Field formatted for submission: ${field}`, {
            original: value,
            formatted: formattedValue,
            category,
          });
        }
      }
    }
    
    // Add compliance fields if provided
    const complianceFields = ['jornaya_leadid', 'trustedform_cert_url', 'tcpa_text'];
    for (const field of complianceFields) {
      if (collectedData[field] && collectedData[field] !== '') {
        leadData[field as keyof LeadData] = collectedData[field];
      }
    }
    
    // Validate required fields are present
    const validation = validateRequiredFields(leadData as LeadData, category);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }
    
    const generationTime = Date.now() - startTime;
    console.log(`✅ Lead data generated for ${category} (${generationTime}ms)`, {
      fieldCount: Object.keys(leadData).length,
      campaignId: leadData.lp_campaign_id,
    });
    
    return {
      success: true,
      leadData: leadData as LeadData,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error('❌ Error generating lead data:', error);
    return {
      success: false,
      errors: { general: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * Format field value for LeadProsper submission
 */
function formatForSubmission(
  fieldName: string,
  value: any,
  fieldConfig: any,
  category: string
): any {
  const type = fieldConfig.type || 'text';
  const format = fieldConfig.format;
  
  // Handle date formatting
  if (type === 'date' && format) {
    return formatDateField(value, format, fieldName);
  }
  
  // Handle phone formatting
  if (type === 'phone' && format) {
    return formatPhoneField(value, format);
  }
  
  // Handle enum formatting (ensure proper case)
  if (type === 'enum') {
    return formatEnumField(value, fieldConfig);
  }
  
  // Default: return as-is
  return value;
}

/**
 * Format date field according to required format
 */
function formatDateField(value: any, requiredFormat: string, fieldName: string): string {
  // Check if already in correct format
  if (isDateInCorrectFormat(value, requiredFormat)) {
    return value;
  }
  
  // Convert to timestamp and reformat
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    console.warn(`⚠️ Could not parse date for formatting: ${fieldName} = ${value}`);
    return value;
  }
  
  const formattedDate = formatDateByPattern(date, requiredFormat);
  
  if (formattedDate) {
    return formattedDate;
  }
  
  return value;
}

/**
 * Format phone field according to required format
 */
function formatPhoneField(value: any, requiredFormat: string): string {
  // Extract just digits
  const clean = value.toString().replace(/\D/g, '');
  
  // Remove leading 1 if present and we have 11 digits
  const digits = clean.length === 11 && clean.startsWith('1') ? clean.substring(1) : clean;
  
  if (digits.length !== 10) {
    return value; // Return original if not 10 digits
  }
  
  // Format based on required format
  if (requiredFormat === '(650) 327-1100') {
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  } else if (requiredFormat === '6503271100') {
    return digits;
  }
  
  // Default to formatted
  return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
}

/**
 * Format enum field (ensure proper case/format)
 */
function formatEnumField(value: any, fieldConfig: any): string {
  const allowedValues = fieldConfig.allowed_values || [];
  const valueStr = value.toString().toLowerCase();
  
  // Find exact match (case-insensitive)
  for (const allowed of allowedValues) {
    if (allowed.toLowerCase() === valueStr) {
      return allowed; // Return in the exact case from allowed values
    }
  }
  
  return value; // Return original if no match
}

/**
 * Check if date is already in correct format
 */
function isDateInCorrectFormat(value: any, requiredFormat: string): boolean {
  const formatPatterns: Record<string, RegExp> = {
    'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
    'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
    'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
    'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/,
  };
  
  const pattern = formatPatterns[requiredFormat];
  if (pattern) {
    return pattern.test(value.toString());
  }
  
  return false;
}

/**
 * Format date according to pattern
 */
function formatDateByPattern(date: Date, pattern: string): string | null {
  const formatMappings: Record<string, string> = {
    'MM/DD/YYYY': 'MM/dd/yyyy',
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd',
    'YYYY/MM/DD': 'yyyy/MM/dd',
    'MM-DD-YYYY': 'MM-dd-yyyy',
    'DD-MM-YYYY': 'dd-MM-yyyy',
  };
  
  const format = formatMappings[pattern] || 'yyyy-MM-dd';
  
  try {
    // Simple date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      case 'yyyy/MM/dd':
        return `${year}/${month}/${day}`;
      case 'MM-dd-yyyy':
        return `${month}-${day}-${year}`;
      case 'dd-MM-yyyy':
        return `${day}-${month}-${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.warn(`⚠️ Date formatting failed: ${pattern}`, error);
    return null;
  }
}

/**
 * Get server-side values
 */
function getServerValue(field: string, serverData?: any): string {
  switch (field) {
    case 'ip_address':
      return serverData?.ip || '';
    case 'user_agent':
      return serverData?.userAgent || '';
    case 'landing_page_url':
      return serverData?.referrer || '';
    default:
      return '';
  }
}

/**
 * Validate that all required fields are present
 */
function validateRequiredFields(leadData: LeadData, category: string): {
  valid: boolean;
  errors?: Record<string, string>;
} {
  const validation = validateLeadData(leadData, category);
  
  if (validation.valid) {
    return { valid: true };
  }
  
  return {
    valid: false,
    errors: validation.errors,
  };
}

/**
 * Determine practice area from lead data
 */
export function determinePracticeArea(input: Record<string, any>): string {
  // Check for explicit main_category field
  if (input.main_category) {
    const mainCategory = input.main_category.toString().toLowerCase().trim();
    
    // Get all practice areas from config
    const { getPracticeAreaNames } = require('../config/practice-areas-loader');
    const practiceAreaNames = getPracticeAreaNames();
    
    for (const areaKey of practiceAreaNames) {
      const areaConfig = getPracticeAreaConfig(areaKey);
      const areaName = areaConfig?.name?.toLowerCase() || '';
      if (mainCategory === areaName) {
        return areaKey;
      }
    }
  }
  
  // Check for campaign ID mapping
  if (input.lp_campaign_id) {
    const campaignId = input.lp_campaign_id;
    
    const { getPracticeAreaNames } = require('../config/practice-areas-loader');
    const practiceAreaNames = getPracticeAreaNames();
    
    for (const areaKey of practiceAreaNames) {
      const areaConfig = getPracticeAreaConfig(areaKey);
      if (areaConfig?.lead_prosper_config?.lp_campaign_id === campaignId) {
        return areaKey;
      }
    }
  }
  
  // Check for subcategory-to-practice-area mapping
  if (input.sub_category) {
    const subcategory = input.sub_category.toString().toLowerCase().trim();
    
    const { getPracticeAreaNames } = require('../config/practice-areas-loader');
    const practiceAreaNames = getPracticeAreaNames();
    
    for (const areaKey of practiceAreaNames) {
      const areaConfig = getPracticeAreaConfig(areaKey);
      const subcategories = areaConfig?.subcategories || [];
      
      // Check if the input subcategory matches any in this practice area
      for (const configSubcategory of subcategories) {
        if (configSubcategory.toLowerCase().trim() === subcategory) {
          return areaKey;
        }
      }
    }
  }
  
  console.log('ℹ️ Practice area detection in LeadGenerator', {
    mainCategory: input.main_category || 'not_set',
    campaignId: input.lp_campaign_id || 'not_set',
    subCategory: input.sub_category || 'not_set',
    detectedArea: 'general (default)',
  });
  
  // Default to general if can't determine
  return 'general';
}

/**
 * Get lead generation statistics
 */
export function getLeadGenerationStats(): {
  totalCategories: number;
  categoriesWithLPConfig: number;
  averageFieldsPerCategory: number;
} {
  try {
    const { getPracticeAreaNames } = require('../config/practice-areas-loader');
    const categoryNames = getPracticeAreaNames();
    
    let totalFields = 0;
    let categoriesWithLPConfig = 0;
    
    for (const category of categoryNames) {
      const areaConfig = getPracticeAreaConfig(category);
      
      if (areaConfig?.lead_prosper_config) {
        categoriesWithLPConfig++;
      }
      
      const requiredFields = getRequiredFields(category);
      totalFields += Object.keys(requiredFields).length;
    }
    
    return {
      totalCategories: categoryNames.length,
      categoriesWithLPConfig,
      averageFieldsPerCategory: categoryNames.length > 0 ? totalFields / categoryNames.length : 0,
    };
  } catch (error) {
    console.error('❌ Error getting lead generation stats:', error);
    return {
      totalCategories: 0,
      categoriesWithLPConfig: 0,
      averageFieldsPerCategory: 0,
    };
  }
}
