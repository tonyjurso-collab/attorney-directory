/**
 * Environment Variable Validation Utilities
 * 
 * Provides utilities to validate and check environment variables
 * with helpful error messages and debugging information.
 */

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  presentVars: string[];
  errors: string[];
}

/**
 * Validates that required environment variables are present
 */
export function validateEnvVars(requiredVars: string[]): EnvValidationResult {
  const missingVars: string[] = [];
  const presentVars: string[] = [];
  const errors: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      missingVars.push(varName);
      errors.push(`Environment variable '${varName}' is not set or is empty`);
    } else {
      presentVars.push(varName);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    presentVars,
    errors
  };
}

/**
 * Validates Algolia-specific environment variables
 */
export function validateAlgoliaEnv(): EnvValidationResult {
  const requiredVars = [
    'NEXT_PUBLIC_ALGOLIA_APP_ID',
    'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY',
    'ALGOLIA_ADMIN_API_KEY'
  ];

  return validateEnvVars(requiredVars);
}

/**
 * Gets environment variable status for debugging
 */
export function getEnvStatus(varName: string): {
  exists: boolean;
  hasValue: boolean;
  length: number;
  preview: string;
} {
  const value = process.env[varName];
  
  return {
    exists: varName in process.env,
    hasValue: Boolean(value && value.trim() !== ''),
    length: value ? value.length : 0,
    preview: value ? `${value.substring(0, 8)}...` : 'NOT SET'
  };
}

/**
 * Logs environment variable status for debugging
 */
export function logEnvStatus(prefix: string = 'Environment Status'): void {
  console.log(`\n${prefix}:`);
  console.log('='.repeat(prefix.length + 1));
  
  const algoliaVars = [
    'NEXT_PUBLIC_ALGOLIA_APP_ID',
    'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY', 
    'ALGOLIA_ADMIN_API_KEY'
  ];

  algoliaVars.forEach(varName => {
    const status = getEnvStatus(varName);
    console.log(`${varName}: ${status.hasValue ? 'SET' : 'NOT SET'} ${status.hasValue ? `(${status.length} chars)` : ''}`);
  });

  console.log(`Total env vars: ${Object.keys(process.env).length}`);
  console.log(`Node version: ${process.version}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('');
}

/**
 * Creates a user-friendly error message for missing environment variables
 */
export function createEnvErrorMessage(result: EnvValidationResult): string {
  if (result.isValid) {
    return 'All required environment variables are present.';
  }

  let message = 'Missing required environment variables:\n';
  result.missingVars.forEach(varName => {
    message += `  - ${varName}\n`;
  });
  
  message += '\nPlease check your .env.local file and ensure:\n';
  message += '  - Variables are spelled correctly\n';
  message += '  - No spaces around the = sign\n';
  message += '  - No quotes around values\n';
  message += '  - File is in the project root\n';
  message += '  - Server has been restarted after changes\n';

  return message;
}
