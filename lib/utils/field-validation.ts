/**
 * Field validation utility functions
 */

export interface ValidationResult {
  isValid: boolean;
  value?: any;
  error?: string;
}

/**
 * Validate a field value based on its type and validation rules
 */
export function validateField(type: string, value: any, validationRule?: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'This field is required.' };
  }

  switch (type) {
    case 'text':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Must be text.' };
      }
      if (validationRule && !new RegExp(validationRule).test(value)) {
        return { isValid: false, error: 'Invalid format.' };
      }
      return { isValid: true, value: value.trim() };

    case 'email':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Must be an email address.' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Please enter a valid email address.' };
      }
      return { isValid: true, value: value.toLowerCase().trim() };

    case 'phone':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Must be a phone number.' };
      }
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');
      if (digits.length === 10) {
        // Format as (XXX) XXX-XXXX
        const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        return { isValid: true, value: formatted };
      } else if (digits.length === 11 && digits[0] === '1') {
        // Format as (XXX) XXX-XXXX for US numbers
        const formatted = `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        return { isValid: true, value: formatted };
      }
      return { isValid: false, error: 'Please enter a valid 10-digit phone number.' };

    case 'zip':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Must be a ZIP code.' };
      }
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(value)) {
        return { isValid: false, error: 'Please enter a valid ZIP code (12345 or 12345-6789).' };
      }
      return { isValid: true, value: value.trim() };

    case 'number':
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        return { isValid: false, error: 'Must be a number.' };
      }
      return { isValid: true, value: numValue };

    case 'date':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Must be a date.' };
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Please enter a valid date.' };
      }
      return { isValid: true, value: value.trim() };

    case 'boolean':
      if (typeof value === 'boolean') {
        return { isValid: true, value };
      }
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (['true', 'yes', '1', 'on'].includes(lowerValue)) {
          return { isValid: true, value: true };
        }
        if (['false', 'no', '0', 'off'].includes(lowerValue)) {
          return { isValid: true, value: false };
        }
      }
      return { isValid: false, error: 'Must be yes or no.' };

    default:
      return { isValid: true, value };
  }
}