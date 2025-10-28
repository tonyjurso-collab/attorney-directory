/**
 * Custom error class for chat system
 */

export class ChatError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.statusCode = statusCode;
  }
}