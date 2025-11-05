import practiceAreasConfig from '../../chat/practice_areas_config.json';

interface PracticeAreaConfig {
  name: string;
  personality: {
    compassionate_intro: string;
    context_intros?: Record<string, string>;
  };
  field_questions: Record<string, string | Record<string, string>>;
  lead_prosper_config: {
    lp_campaign_id: number;
    lp_supplier_id: number;
    lp_key: string;
  };
  subcategories: string[];
  chat_flow: Array<{
    order: number;
    field: string;
  }>;
  required_fields: Record<string, any>;
}

export function getPracticeAreaConfig(category: string): PracticeAreaConfig | null {
  const practiceArea = practiceAreasConfig.legal_practice_areas[category as keyof typeof practiceAreasConfig.legal_practice_areas];
  return (practiceArea as PracticeAreaConfig) || null;
}

export function getRequiredFieldsForCategory(category: string): string[] {
  const config = getPracticeAreaConfig(category);
  if (!config) return [];

  // Filter out fields that should be auto-populated or have server/config sources
  const requiredFields = Object.keys(config.required_fields).filter(field => {
    const fieldConfig = config.required_fields[field];
    
    // Skip fields with server/config sources
    if (fieldConfig.source === 'server' || fieldConfig.source === 'config') {
      return false;
    }
    
    // Skip auto-populated fields
    if (['sub_category', 'city', 'state'].includes(field)) {
      return false;
    }
    
    // Only include fields marked as required
    return fieldConfig.required === true;
  });

  return requiredFields;
}

export function getQuestionForField(category: string, field: string, context: Record<string, any> = {}): string {
  const config = getPracticeAreaConfig(category);
  if (!config) return `What is your ${field}?`;

  const fieldQuestion = config.field_questions[field];
  if (!fieldQuestion) return `What is your ${field}?`;

  // Handle string questions
  if (typeof fieldQuestion === 'string') {
    return fieldQuestion;
  }

  // Handle object questions with context
  if (typeof fieldQuestion === 'object') {
    // Use context to determine which question variant to use
    const contextKey = context.subcategory || context.category || 'default';
    return fieldQuestion[contextKey] || fieldQuestion.default || `What is your ${field}?`;
  }

  return `What is your ${field}?`;
}

export function getLeadProsperConfig(category: string) {
  const config = getPracticeAreaConfig(category);
  return config?.lead_prosper_config || null;
}

export function getSubcategories(category: string): string[] {
  const config = getPracticeAreaConfig(category);
  return config?.subcategories || [];
}
