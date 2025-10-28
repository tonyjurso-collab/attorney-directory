import { ChatSessionData } from '../config/schemas';
import { getPracticeAreaBySlug } from '../config/practice-areas-loader';
import { logger } from '@/lib/logging/logger';

export interface FieldExtractionResult {
  fields: Record<string, any>;
  confidence: number;
}

export class FieldExtractionService {
  /**
   * Extract field values from user message
   */
  async extractFields(
    message: string, 
    session: ChatSessionData, 
    fieldsToExtract: Array<{ name: string; type: string; validation?: string }>
  ): Promise<Record<string, any>> {
    const extractedFields: Record<string, any> = {};
    const lowerMessage = message.toLowerCase();

    for (const field of fieldsToExtract) {
      const value = this.extractFieldValue(message, lowerMessage, field);
      if (value !== null) {
        extractedFields[field.name] = value;
        logger.debug(`Extracted field ${field.name}: ${value}`);
      }
    }

    return extractedFields;
  }

  /**
   * Extract a specific field value from the message
   */
  private extractFieldValue(
    message: string, 
    lowerMessage: string, 
    field: { name: string; type: string; validation?: string }
  ): any {
    switch (field.name) {
      case 'first_name':
      case 'last_name':
        return this.extractName(message, field.name);

      case 'email':
        return this.extractEmail(message);

      case 'phone':
        return this.extractPhone(message);

      case 'zip_code':
        return this.extractZipCode(message);

      case 'description':
        return this.extractDescription(message);

      case 'incident_date':
        return this.extractDate(message);

      default:
        // Generic text extraction
        return this.extractGenericText(message, field.name);
    }
  }

  private extractName(message: string, fieldName: string): string | null {
    // Look for patterns like "My name is John" or "I'm John"
    const patterns = [
      /(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i,
      /(?:name|called)\s*:?\s*([a-zA-Z]+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If no pattern matches and the message is a simple word, treat it as a direct answer
    const trimmed = message.trim();
    const simpleWordPattern = /^[a-zA-Z]+$/;
    if (simpleWordPattern.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  private extractEmail(message: string): string | null {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = message.match(emailRegex);
    return match ? match[0] : null;
  }

  private extractPhone(message: string): string | null {
    // Match various phone number formats
    const phoneRegex = /(?:\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4}))/;
    const match = message.match(phoneRegex);
    if (match) {
      const [, area, exchange, number] = match;
      return `(${area}) ${exchange}-${number}`;
    }
    return null;
  }

  private extractZipCode(message: string): string | null {
    const zipRegex = /\b(\d{5}(?:-\d{4})?)\b/;
    const match = message.match(zipRegex);
    return match ? match[1] : null;
  }

  private extractDescription(message: string): string | null {
    // For description, we might want to return the whole message or a cleaned version
    // This is a simple implementation - in practice, you might want more sophisticated extraction
    if (message.length > 10) {
      return message.trim();
    }
    return null;
  }

  private extractDate(message: string): string | null {
    // Match various date formats
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/, // MM/DD/YYYY
      /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD
      /(\d{1,2}-\d{1,2}-\d{4})/, // MM-DD-YYYY
    ];

    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  private extractGenericText(message: string, fieldName: string): string | null {
    // Look for patterns like "fieldName: value" or "fieldName is value"
    const patterns = [
      new RegExp(`${fieldName}\\s*:?\\s*([^\\n\\r]+)`, 'i'),
      new RegExp(`${fieldName}\\s+is\\s+([^\\n\\r]+)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }
}