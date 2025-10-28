/**
 * Simple logging utility
 */

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`ℹ️ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(`⚠️ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  
  error: (message: string, meta?: any) => {
    console.error(`❌ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
};