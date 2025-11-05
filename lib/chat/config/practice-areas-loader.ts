import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Types for the practice areas configuration
export interface FieldConfig {
  type: 'text' | 'email' | 'phone' | 'zip' | 'state' | 'city' | 'date' | 'enum' | 'numeric' | 'ip' | 'url' | 'postal_code';
  required: boolean;
  value?: any;
  source?: 'config' | 'server' | 'optional' | 'tracking' | 'compliance';
  format?: string;
  allowed_values?: string[];
  max_length?: number;
  description?: string;
  validation?: string;
  example?: string;
}

export interface PracticeAreaConfig {
  name: string;
  description?: string;
  personality?: {
    compassionate_intro: string;
    context_intros?: Record<string, string>;
  };
  field_questions?: Record<string, string | Record<string, string>>;
  lead_prosper_config: {
    lp_campaign_id: number;
    lp_supplier_id: number;
    lp_key: string;
  };
  subcategories: string[];
  chat_flow: Array<{ order: number; field: string }>;
  required_fields: Record<string, FieldConfig>;
  conversation_prompts?: Record<string, string>;
  ai_detection_keywords?: string[];
  special_considerations?: Record<string, any>;
  follow_up_questions?: Record<string, string[]>;
}

export interface PracticeAreasConfig {
  legal_practice_areas: Record<string, PracticeAreaConfig>;
  generic_chat_flow?: Array<{ order: number; field: string }>;
}

// Cache for loaded configuration
let configCache: PracticeAreasConfig | null = null;
let configLoadTime: number | null = null;

/**
 * Load practice areas configuration from JSON file
 */
export function loadPracticeAreasConfig(): PracticeAreasConfig {
  // Return cached config if it exists and is recent (within 5 minutes)
  if (configCache && configLoadTime && Date.now() - configLoadTime < 5 * 60 * 1000) {
    return configCache;
  }

  try {
    // Try multiple possible paths for the config file
    const possiblePaths = [
      path.join(process.cwd(), 'chat', 'practice_areas_config.json'),
      path.join(process.cwd(), 'lib', 'practice_areas_config.json'),
      path.join(process.cwd(), 'public', 'practice_areas_config.json'),
    ];

    let configPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath;
        break;
      }
    }

    if (!configPath) {
      throw new Error('Practice areas config file not found in any expected location');
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData) as PracticeAreasConfig;

    // Validate the configuration structure
    validateConfigStructure(config);

    configCache = config;
    configLoadTime = Date.now();

    console.log(`✅ Practice areas config loaded from ${configPath}`);
    console.log(`📊 Loaded ${Object.keys(config.legal_practice_areas).length} practice areas`);

    return config;
  } catch (error) {
    console.error('❌ Error loading practice areas config:', error);
    throw new Error(`Failed to load practice areas configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific practice area configuration
 */
export function getPracticeAreaConfig(category: string): PracticeAreaConfig | null {
  const config = loadPracticeAreasConfig();
  return config.legal_practice_areas[category] || null;
}

/**
 * Get practice area by slug (for new config format)
 */
export function getPracticeAreaBySlug(slug: string): any | null {
  try {
    const config = loadPracticeAreasConfig();
    // Use legal_practice_areas (Record format) - slug is the key
    return config.legal_practice_areas[slug] || null;
  } catch (error) {
    console.error('Error getting practice area by slug:', error);
    return null;
  }
}

/**
 * Returns a simplified list of all practice areas for AI detection.
 * This provides just the essential information needed for categorization.
 */
export function getAllPracticeAreasSummary(): Array<{
  key: string;
  name: string;
  description: string;
  subcategories: string[];
}> {
  const config = loadPracticeAreasConfig();
  
  return Object.entries(config.legal_practice_areas)
    .filter(([key, _]) => key !== 'generic_chat_flow') // Skip generic flow
    .map(([key, area]) => ({
      key,
      name: area.name,
      description: area.description || area.name,
      subcategories: area.subcategories || []
    }));
}

/**
 * Get all practice area names
 */
export function getPracticeAreaNames(): string[] {
  const config = loadPracticeAreasConfig();
  return Object.keys(config.legal_practice_areas);
}

/**
 * Get chat flow for a specific category
 */
export function getChatFlow(category: string): Array<{ order: number; field: string }> {
  const practiceArea = getPracticeAreaConfig(category);
  return practiceArea?.chat_flow || [];
}

/**
 * Get required fields for a specific category
 */
export function getRequiredFields(category: string): Record<string, FieldConfig> {
  const practiceArea = getPracticeAreaConfig(category);
  return practiceArea?.required_fields || {};
}

/**
 * Get field question for a specific field in a category
 */
export function getFieldQuestion(category: string, field: string): string | null {
  const practiceArea = getPracticeAreaConfig(category);
  if (!practiceArea?.field_questions?.[field]) {
    return null;
  }

  const question = practiceArea.field_questions[field];
  
  // Handle object-based questions (context-aware)
  if (typeof question === 'object' && question !== null) {
    // Return default variant or first available variant
    return question.default || Object.values(question)[0] as string;
  }
  
  return typeof question === 'string' ? question : null;
}

/**
 * Get compassionate intro for a category
 */
export function getCompassionateIntro(category: string): string {
  const practiceArea = getPracticeAreaConfig(category);
  return practiceArea?.personality?.compassionate_intro || "I'm here to help you find the right attorney.";
}

/**
 * Get context-specific intro for a category
 */
export function getContextIntro(category: string, context: string): string | null {
  const practiceArea = getPracticeAreaConfig(category);
  return practiceArea?.personality?.context_intros?.[context] || null;
}

/**
 * Get AI detection keywords for a category
 */
export function getDetectionKeywords(category: string): string[] {
  const practiceArea = getPracticeAreaConfig(category);
  return practiceArea?.ai_detection_keywords || [];
}

/**
 * Validate configuration structure
 */
function validateConfigStructure(config: any): void {
  // Handle new format
  if (config.practiceAreas && Array.isArray(config.practiceAreas)) {
    for (const practiceArea of config.practiceAreas) {
      if (!practiceArea.name || typeof practiceArea.name !== 'string') {
        throw new Error(`Invalid name for practice area ${practiceArea.slug || 'unknown'}`);
      }
      if (!practiceArea.slug || typeof practiceArea.slug !== 'string') {
        throw new Error(`Invalid slug for practice area ${practiceArea.name}`);
      }
    }
    return; // New format validated
  }

  // Handle old format
  if (!config.legal_practice_areas || typeof config.legal_practice_areas !== 'object') {
    throw new Error('Invalid config: missing or invalid legal_practice_areas');
  }

  for (const [categoryKey, practiceArea] of Object.entries(config.legal_practice_areas)) {
    // Skip generic_chat_flow as it's not a practice area
    if (categoryKey === 'generic_chat_flow') {
      continue;
    }
    
    if (!practiceArea || typeof practiceArea !== 'object') {
      throw new Error(`Invalid practice area config for ${categoryKey}`);
    }

    const area = practiceArea as any;
    
    // Validate required fields
    if (!area.name || typeof area.name !== 'string') {
      throw new Error(`Invalid name for practice area ${categoryKey}`);
    }
    
    if (!area.lead_prosper_config || typeof area.lead_prosper_config !== 'object') {
      throw new Error(`Invalid lead_prosper_config for practice area ${categoryKey}`);
    }
    
    if (!area.subcategories || !Array.isArray(area.subcategories)) {
      throw new Error(`Invalid subcategories for practice area ${categoryKey}`);
    }
    
    if (!area.chat_flow || !Array.isArray(area.chat_flow)) {
      throw new Error(`Invalid chat_flow for practice area ${categoryKey}`);
    }
    
    if (!area.required_fields || typeof area.required_fields !== 'object') {
      throw new Error(`Invalid required_fields for practice area ${categoryKey}`);
    }
  }
}

/**
 * Clear config cache (useful for testing or hot reloading)
 */
export function clearConfigCache(): void {
  configCache = null;
  configLoadTime = null;
}

/**
 * Get config statistics for monitoring
 */
export function getConfigStats(): {
  totalPracticeAreas: number;
  totalSubcategories: number;
  totalRequiredFields: number;
  lastLoaded: number | null;
} {
  const config = loadPracticeAreasConfig();
  
  let totalSubcategories = 0;
  let totalRequiredFields = 0;
  
  for (const practiceArea of Object.values(config.legal_practice_areas)) {
    totalSubcategories += practiceArea.subcategories.length;
    totalRequiredFields += Object.keys(practiceArea.required_fields).length;
  }
  
  return {
    totalPracticeAreas: Object.keys(config.legal_practice_areas).length,
    totalSubcategories,
    totalRequiredFields,
    lastLoaded: configLoadTime,
  };
}
