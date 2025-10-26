/**
 * Validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validates phone number format (10 digits or common formats)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits
  if (digitsOnly.length === 10) {
    return { isValid: true };
  }
  
  // Check if it's 11 digits starting with 1 (US format)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return { isValid: true };
  }

  // Check common formats: (123) 456-7890, 123-456-7890, 123.456.7890
  const phoneRegex = /^[\+]?[1]?[\s]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/;
  if (phoneRegex.test(phone.trim())) {
    return { isValid: true };
  }

  return { isValid: false, error: 'Please enter a valid phone number (10 digits)' };
}

/**
 * Validates ZIP code format (5 digits or 5+4 format)
 */
export function validateZipCode(zipCode: string): ValidationResult {
  if (!zipCode || zipCode.trim() === '') {
    return { isValid: false, error: 'ZIP code is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = zipCode.replace(/\D/g, '');
  
  // Check if it's exactly 5 digits
  if (digitsOnly.length === 5) {
    return { isValid: true };
  }
  
  // Check if it's 9 digits (5+4 format)
  if (digitsOnly.length === 9) {
    return { isValid: true };
  }

  // Check common formats: 12345, 12345-6789, 12345 6789
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (zipRegex.test(zipCode.trim())) {
    return { isValid: true };
  }

  return { isValid: false, error: 'Please enter a valid ZIP code (5 digits)' };
}

/**
 * Formats phone number to standard format
 */
export function formatPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `(${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Formats ZIP code to standard format
 */
export function formatZipCode(zipCode: string): string {
  const digitsOnly = zipCode.replace(/\D/g, '');
  
  if (digitsOnly.length === 5) {
    return digitsOnly;
  }
  
  if (digitsOnly.length === 9) {
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
  }
  
  return zipCode; // Return original if can't format
}
