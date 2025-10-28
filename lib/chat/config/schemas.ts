import { z } from 'zod';
import { loadPracticeAreasConfig, getRequiredFields, FieldConfig } from './practice-areas-loader';

// Chat session schemas
export const FieldSchema = z.object({
  name: z.string(),
  question: z.string(),
  type: z.enum(['text', 'number', 'email', 'phone', 'zip', 'boolean', 'date']),
  required: z.boolean().default(false),
  validation: z.string().optional(), // Regex or custom validation rule name
  errorMessage: z.string().optional(),
});

export const SubCategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  fields: z.array(FieldSchema).optional(),
});

export const PracticeAreaSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  initialMessage: z.string().optional(),
  disclaimer: z.string().optional(),
  fields: z.array(FieldSchema).optional(),
  subCategories: z.array(SubCategorySchema).optional(),
});

export const PracticeAreaConfigSchema = z.object({
  defaultWelcomeMessage: z.string().optional(),
  defaultDisclaimer: z.string().optional(),
  practiceAreas: z.array(PracticeAreaSchema),
});

export const ChatSessionDataSchema = z.object({
  sid: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  landingPageUrl: z.string().optional(), // Add landing page URL
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string(),
  main_category: z.string().nullable().optional(),
  sub_category: z.string().nullable().optional(),
  stage: z.enum(['COLLECTING', 'READY_TO_SUBMIT', 'SUBMITTED', 'FAILED_SUBMISSION']).default('COLLECTING'),
  answers: z.record(z.string(), z.any()).default({}), // Collected field answers
  asked: z.array(z.string()).default([]), // Fields that have been asked
  transcript: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    text: z.string(),
    timestamp: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
  })).default([]),
  leadId: z.string().nullable().optional(), // ID from lead submission system
  leadStatus: z.string().nullable().optional(), // Status from lead submission system
  // LeadProsper response fields
  leadprosper_lead_id: z.string().nullable().optional(),
  leadprosper_status: z.string().nullable().optional(),
  leadprosper_code: z.number().nullable().optional(),
  leadprosper_message: z.string().nullable().optional(),
  leadprosper_response: z.record(z.string(), z.any()).nullable().optional(),
});

export type ChatSessionData = z.infer<typeof ChatSessionDataSchema>;

// Cache for generated schemas
const schemaCache = new Map<string, z.ZodSchema>();

/**
 * Generate Zod schema for a specific practice area category
 */
export function getCategorySchema(category: string): z.ZodSchema {
  // Return cached schema if available
  if (schemaCache.has(category)) {
    return schemaCache.get(category)!;
  }

  const requiredFields = getRequiredFields(category);
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  // Generate schema fields based on required_fields configuration
  for (const [fieldName, fieldConfig] of Object.entries(requiredFields)) {
    const fieldSchema = createFieldSchema(fieldName, fieldConfig);
    
    // Make field optional if not required
    if (!fieldConfig.required) {
      schemaFields[fieldName] = fieldSchema.optional();
    } else {
      schemaFields[fieldName] = fieldSchema;
    }
  }

  const schema = z.object(schemaFields);
  
  // Cache the schema
  schemaCache.set(category, schema);
  
  return schema;
}

/**
 * Create Zod schema for a specific field based on its configuration
 */
function createFieldSchema(fieldName: string, fieldConfig: FieldConfig): z.ZodTypeAny {
  const { type, allowed_values, max_length, format } = fieldConfig;

  switch (type) {
    case 'text':
      let textSchema = z.string();
      if (max_length) {
        textSchema = textSchema.max(max_length);
      }
      return textSchema.min(1, `${fieldName} is required`);

    case 'email':
      return z.string().email(`Invalid email format for ${fieldName}`);

    case 'phone':
      return z.string().regex(
        /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/,
        `Invalid phone format for ${fieldName}. Use (XXX) XXX-XXXX format`
      );

    case 'zip':
    case 'postal_code':
      return z.string().regex(
        /^\d{5}(-\d{4})?$/,
        `Invalid ZIP code format for ${fieldName}. Use 12345 or 12345-6789 format`
      );

    case 'state':
      return z.string().regex(
        /^[A-Z]{2}$/,
        `Invalid state format for ${fieldName}. Use 2-letter state code (e.g., CA, NY)`
      );

    case 'city':
      let citySchema = z.string();
      if (max_length) {
        citySchema = citySchema.max(max_length);
      }
      return citySchema.min(1, `${fieldName} is required`);

    case 'date':
      if (format === 'YYYY-MM-DD') {
        return z.string().regex(
          /^\d{4}-\d{2}-\d{2}$/,
          `Invalid date format for ${fieldName}. Use YYYY-MM-DD format`
        );
      } else if (format === 'MM/DD/YYYY') {
        return z.string().regex(
          /^\d{2}\/\d{2}\/\d{4}$/,
          `Invalid date format for ${fieldName}. Use MM/DD/YYYY format`
        );
      }
      return z.string().min(1, `${fieldName} is required`);

    case 'enum':
      if (allowed_values && allowed_values.length > 0) {
        return z.enum(allowed_values as [string, ...string[]], {
          errorMap: () => ({ message: `${fieldName} must be one of: ${allowed_values.join(', ')}` })
        });
      }
      return z.string().min(1, `${fieldName} is required`);

    case 'numeric':
      return z.number().int(`Invalid number format for ${fieldName}`);

    case 'ip':
      return z.string().ip(`Invalid IP address format for ${fieldName}`);

    case 'url':
      return z.string().url(`Invalid URL format for ${fieldName}`);

    default:
      return z.string().min(1, `${fieldName} is required`);
  }
}

/**
 * Validate field value against its schema
 */
export function validateField(
  fieldName: string,
  value: any,
  category: string
): { valid: boolean; value?: any; error?: string } {
  try {
    const schema = getCategorySchema(category);
    const fieldSchema = schema.shape[fieldName];
    
    if (!fieldSchema) {
      return { valid: false, error: `Field ${fieldName} not found in schema` };
    }

    const result = fieldSchema.safeParse(value);
    
    if (result.success) {
      return { valid: true, value: result.data };
    } else {
      return { valid: false, error: result.error.errors[0]?.message || 'Validation failed' };
    }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}

/**
 * Validate complete lead data against category schema
 */
export function validateLeadData(
  leadData: Record<string, any>,
  category: string
): { valid: boolean; errors?: Record<string, string>; data?: any } {
  try {
    const schema = getCategorySchema(category);
    const result = schema.safeParse(leadData);
    
    if (result.success) {
      return { valid: true, data: result.data };
    } else {
      const errors: Record<string, string> = {};
      
      for (const error of result.error.errors) {
        const fieldName = error.path.join('.');
        errors[fieldName] = error.message;
      }
      
      return { valid: false, errors };
    }
  } catch (error) {
    return { 
      valid: false, 
      errors: { general: error instanceof Error ? error.message : 'Unknown validation error' }
    };
  }
}

/**
 * Get field type information for a specific field
 */
export function getFieldTypeInfo(fieldName: string, category: string): FieldConfig | null {
  const requiredFields = getRequiredFields(category);
  return requiredFields[fieldName] || null;
}

/**
 * Check if a field is required for a category
 */
export function isFieldRequired(fieldName: string, category: string): boolean {
  const fieldConfig = getFieldTypeInfo(fieldName, category);
  return fieldConfig?.required || false;
}

/**
 * Get allowed values for enum fields
 */
export function getAllowedValues(fieldName: string, category: string): string[] {
  const fieldConfig = getFieldTypeInfo(fieldName, category);
  return fieldConfig?.allowed_values || [];
}

/**
 * Clear schema cache (useful for testing or hot reloading)
 */
export function clearSchemaCache(): void {
  schemaCache.clear();
}

/**
 * Get schema statistics for monitoring
 */
export function getSchemaStats(): {
  cachedSchemas: number;
  totalFields: number;
  fieldTypes: Record<string, number>;
} {
  const config = loadPracticeAreasConfig();
  const fieldTypes: Record<string, number> = {};
  let totalFields = 0;

  for (const practiceArea of Object.values(config.legal_practice_areas)) {
    for (const fieldConfig of Object.values(practiceArea.required_fields)) {
      fieldTypes[fieldConfig.type] = (fieldTypes[fieldConfig.type] || 0) + 1;
      totalFields++;
    }
  }

  return {
    cachedSchemas: schemaCache.size,
    totalFields,
    fieldTypes,
  };
}

/**
 * Pre-generate schemas for all practice areas (useful for startup optimization)
 */
export function preGenerateSchemas(): void {
  const config = loadPracticeAreasConfig();
  
  for (const category of Object.keys(config.legal_practice_areas)) {
    getCategorySchema(category);
  }
  
  console.log(`✅ Pre-generated schemas for ${Object.keys(config.legal_practice_areas).length} practice areas`);
}
