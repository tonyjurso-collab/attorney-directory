/**
 * US States configuration and utilities
 * Centralized state data for consistency across the application
 */

export interface USState {
  code: string;
  name: string;
  slug: string;
}

export const US_STATES: USState[] = [
  { code: 'AL', name: 'Alabama', slug: 'al' },
  { code: 'AK', name: 'Alaska', slug: 'ak' },
  { code: 'AZ', name: 'Arizona', slug: 'az' },
  { code: 'AR', name: 'Arkansas', slug: 'ar' },
  { code: 'CA', name: 'California', slug: 'ca' },
  { code: 'CO', name: 'Colorado', slug: 'co' },
  { code: 'CT', name: 'Connecticut', slug: 'ct' },
  { code: 'DE', name: 'Delaware', slug: 'de' },
  { code: 'FL', name: 'Florida', slug: 'fl' },
  { code: 'GA', name: 'Georgia', slug: 'ga' },
  { code: 'HI', name: 'Hawaii', slug: 'hi' },
  { code: 'ID', name: 'Idaho', slug: 'id' },
  { code: 'IL', name: 'Illinois', slug: 'il' },
  { code: 'IN', name: 'Indiana', slug: 'in' },
  { code: 'IA', name: 'Iowa', slug: 'ia' },
  { code: 'KS', name: 'Kansas', slug: 'ks' },
  { code: 'KY', name: 'Kentucky', slug: 'ky' },
  { code: 'LA', name: 'Louisiana', slug: 'la' },
  { code: 'ME', name: 'Maine', slug: 'me' },
  { code: 'MD', name: 'Maryland', slug: 'md' },
  { code: 'MA', name: 'Massachusetts', slug: 'ma' },
  { code: 'MI', name: 'Michigan', slug: 'mi' },
  { code: 'MN', name: 'Minnesota', slug: 'mn' },
  { code: 'MS', name: 'Mississippi', slug: 'ms' },
  { code: 'MO', name: 'Missouri', slug: 'mo' },
  { code: 'MT', name: 'Montana', slug: 'mt' },
  { code: 'NE', name: 'Nebraska', slug: 'ne' },
  { code: 'NV', name: 'Nevada', slug: 'nv' },
  { code: 'NH', name: 'New Hampshire', slug: 'nh' },
  { code: 'NJ', name: 'New Jersey', slug: 'nj' },
  { code: 'NM', name: 'New Mexico', slug: 'nm' },
  { code: 'NY', name: 'New York', slug: 'ny' },
  { code: 'NC', name: 'North Carolina', slug: 'nc' },
  { code: 'ND', name: 'North Dakota', slug: 'nd' },
  { code: 'OH', name: 'Ohio', slug: 'oh' },
  { code: 'OK', name: 'Oklahoma', slug: 'ok' },
  { code: 'OR', name: 'Oregon', slug: 'or' },
  { code: 'PA', name: 'Pennsylvania', slug: 'pa' },
  { code: 'RI', name: 'Rhode Island', slug: 'ri' },
  { code: 'SC', name: 'South Carolina', slug: 'sc' },
  { code: 'SD', name: 'South Dakota', slug: 'sd' },
  { code: 'TN', name: 'Tennessee', slug: 'tn' },
  { code: 'TX', name: 'Texas', slug: 'tx' },
  { code: 'UT', name: 'Utah', slug: 'ut' },
  { code: 'VT', name: 'Vermont', slug: 'vt' },
  { code: 'VA', name: 'Virginia', slug: 'va' },
  { code: 'WA', name: 'Washington', slug: 'wa' },
  { code: 'WV', name: 'West Virginia', slug: 'wv' },
  { code: 'WI', name: 'Wisconsin', slug: 'wi' },
  { code: 'WY', name: 'Wyoming', slug: 'wy' },
  { code: 'DC', name: 'District of Columbia', slug: 'dc' },
];

// Valid state codes (lowercase for URL matching)
export const VALID_STATES = US_STATES.map(state => state.slug);

// State code to full name mapping
const STATE_NAME_MAP: Record<string, string> = {};
US_STATES.forEach(state => {
  STATE_NAME_MAP[state.code.toUpperCase()] = state.name;
  STATE_NAME_MAP[state.slug.toLowerCase()] = state.name;
});

// State slug to code mapping
const STATE_CODE_MAP: Record<string, string> = {};
US_STATES.forEach(state => {
  STATE_CODE_MAP[state.slug.toLowerCase()] = state.code.toUpperCase();
});

/**
 * Get full state name from code or slug
 */
export function getStateName(stateCodeOrSlug: string): string {
  const key = stateCodeOrSlug.toLowerCase();
  return STATE_NAME_MAP[key] || stateCodeOrSlug;
}

/**
 * Get state code from slug
 */
export function getStateCode(stateSlug: string): string {
  const key = stateSlug.toLowerCase();
  return STATE_CODE_MAP[key] || stateSlug.toUpperCase();
}

/**
 * Validate if a state code or slug is valid
 */
export function isValidState(stateCodeOrSlug: string): boolean {
  const key = stateCodeOrSlug.toLowerCase();
  return VALID_STATES.includes(key);
}

/**
 * Get state slug from code
 */
export function getStateSlug(stateCode: string): string {
  const state = US_STATES.find(s => s.code.toUpperCase() === stateCode.toUpperCase());
  return state?.slug || stateCode.toLowerCase();
}

