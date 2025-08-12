/**
 * Security utilities for input validation, sanitization, and protection
 * @file utils/security.ts
 */

import crypto from 'crypto';
import { POLISH_CONTENT } from './polish-content';

// Input sanitization
export class InputSanitizer {
  // Remove HTML tags and dangerous characters
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>'"&]/g, (match) => { // Escape dangerous characters
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return escapeMap[match] || match;
      })
      .trim();
  }
  
  // Sanitize email address
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, ''); // Keep only valid email characters
  }
  
  // Sanitize numeric input
  static sanitizeNumber(input: any): number | null {
    const num = Number(input);
    return isNaN(num) ? null : num;
  }
  
  // Sanitize boolean input
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      return input.toLowerCase() === 'true' || input === '1';
    }
    return Boolean(input);
  }
  
  // Sanitize object by applying sanitization to all string values
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Advanced validation schemas using Joi-like structure
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'email' | 'password' | 'uuid';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean;
    sanitize?: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData?: Record<string, any>;
}

export class AdvancedValidator {
  // Email validation regex
  private static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // UUID validation regex
  private static UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Strong password regex
  private static STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  
  static validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};
    
    // Check for required fields
    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = data[fieldName];
      
      // Check if required field is missing
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[fieldName] = POLISH_CONTENT.errors.required;
        continue;
      }
      
      // Skip validation if field is not required and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        sanitizedData[fieldName] = value;
        continue;
      }
      
      // Sanitize input if requested
      let sanitizedValue = value;
      if (rules.sanitize && typeof value === 'string') {
        sanitizedValue = InputSanitizer.sanitizeString(value);
      }
      
      // Type validation
      const typeValidation = this.validateType(sanitizedValue, rules.type);
      if (!typeValidation.isValid) {
        errors[fieldName] = typeValidation.error!;
        continue;
      }
      
      // Length validation for strings
      if (rules.type === 'string' && typeof sanitizedValue === 'string') {
        if (rules.min && sanitizedValue.length < rules.min) {
          errors[fieldName] = `Pole musi mieć co najmniej ${rules.min} znaków`;
          continue;
        }
        
        if (rules.max && sanitizedValue.length > rules.max) {
          errors[fieldName] = `Pole może mieć maksymalnie ${rules.max} znaków`;
          continue;
        }
      }
      
      // Range validation for numbers
      if (rules.type === 'number' && typeof sanitizedValue === 'number') {
        if (rules.min && sanitizedValue < rules.min) {
          errors[fieldName] = `Wartość musi być co najmniej ${rules.min}`;
          continue;
        }
        
        if (rules.max && sanitizedValue > rules.max) {
          errors[fieldName] = `Wartość może być maksymalnie ${rules.max}`;
          continue;
        }
      }
      
      // Pattern validation
      if (rules.pattern && typeof sanitizedValue === 'string') {
        if (!rules.pattern.test(sanitizedValue)) {
          errors[fieldName] = 'Nieprawidłowy format';
          continue;
        }
      }
      
      // Enum validation
      if (rules.enum && !rules.enum.includes(sanitizedValue)) {
        errors[fieldName] = 'Nieprawidłowa wartość';
        continue;
      }
      
      // Custom validation
      if (rules.custom && !rules.custom(sanitizedValue)) {
        errors[fieldName] = 'Nieprawidłowa wartość';
        continue;
      }
      
      sanitizedData[fieldName] = sanitizedValue;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }
  
  private static validateType(value: any, type: string): { isValid: boolean; error?: string } {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, error: 'Wartość musi być tekstem' };
        }
        break;
        
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return { isValid: false, error: 'Wartość musi być liczbą' };
        }
        break;
        
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
          return { isValid: false, error: 'Wartość musi być prawda/fałsz' };
        }
        break;
        
      case 'email':
        if (typeof value !== 'string' || !this.EMAIL_REGEX.test(value)) {
          return { isValid: false, error: POLISH_CONTENT.errors.invalidEmail };
        }
        break;
        
      case 'password':
        if (typeof value !== 'string') {
          return { isValid: false, error: 'Hasło musi być tekstem' };
        }
        if (value.length < 8) {
          return { isValid: false, error: POLISH_CONTENT.errors.passwordTooShort };
        }
        if (!this.STRONG_PASSWORD_REGEX.test(value)) {
          return { isValid: false, error: 'Hasło musi zawierać co najmniej jedną wielką literę, jedną małą literę i jedną cyfrę' };
        }
        break;
        
      case 'uuid':
        if (typeof value !== 'string' || !this.UUID_REGEX.test(value)) {
          return { isValid: false, error: 'Nieprawidłowy identyfikator' };
        }
        break;
    }
    
    return { isValid: true };
  }
}

// CSRF Token management
export class CSRFProtection {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
  
  // Generate CSRF token
  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    const hash = crypto.createHmac('sha256', this.SECRET_KEY).update(data).digest('hex');
    
    return Buffer.from(`${data}:${hash}`).toString('base64');
  }
  
  // Validate CSRF token
  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [receivedSessionId, timestamp, hash] = decoded.split(':');
      
      // Check if session ID matches
      if (receivedSessionId !== sessionId) {
        return false;
      }
      
      // Check if token is not too old (1 hour)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 60 * 60 * 1000) {
        return false;
      }
      
      // Verify hash
      const expectedHash = crypto.createHmac('sha256', this.SECRET_KEY)
        .update(`${receivedSessionId}:${timestamp}`)
        .digest('hex');
      
      return hash === expectedHash;
    } catch (error) {
      return false;
    }
  }
}

// API Key validation for desktop app
export class APIKeyValidator {
  private static readonly API_KEY_PREFIX = 'pk_';
  private static readonly SECRET_KEY = process.env.API_SECRET || 'default-api-secret-change-in-production';
  
  // Generate API key for desktop app
  static generateAPIKey(userId: string): string {
    const timestamp = Date.now().toString();
    const data = `${userId}:${timestamp}`;
    const hash = crypto.createHmac('sha256', this.SECRET_KEY).update(data).digest('hex');
    
    return `${this.API_KEY_PREFIX}${Buffer.from(`${data}:${hash}`).toString('base64')}`;
  }
  
  // Validate API key
  static validateAPIKey(apiKey: string): { isValid: boolean; userId?: string } {
    try {
      if (!apiKey.startsWith(this.API_KEY_PREFIX)) {
        return { isValid: false };
      }
      
      const keyData = apiKey.substring(this.API_KEY_PREFIX.length);
      const decoded = Buffer.from(keyData, 'base64').toString('utf-8');
      const [userId, timestamp, hash] = decoded.split(':');
      
      // Verify hash
      const expectedHash = crypto.createHmac('sha256', this.SECRET_KEY)
        .update(`${userId}:${timestamp}`)
        .digest('hex');
      
      if (hash !== expectedHash) {
        return { isValid: false };
      }
      
      return { isValid: true, userId };
    } catch (error) {
      return { isValid: false };
    }
  }
}

// Common validation schemas
export const securitySchemas = {
  // Login validation
  login: {
    email: {
      type: 'email' as const,
      required: true,
      sanitize: true
    },
    password: {
      type: 'string' as const,
      required: true,
      min: 1
    }
  },
  
  // Registration validation
  register: {
    email: {
      type: 'email' as const,
      required: true,
      sanitize: true
    },
    password: {
      type: 'password' as const,
      required: true
    }
  },
  
  // Credit consumption validation
  creditConsumption: {
    amount: {
      type: 'number' as const,
      required: true,
      min: 1,
      max: 100
    },
    description: {
      type: 'string' as const,
      required: false,
      max: 255,
      sanitize: true
    }
  },
  
  // Contact form validation
  contactForm: {
    subject: {
      type: 'string' as const,
      required: true,
      min: 5,
      max: 100,
      sanitize: true
    },
    message: {
      type: 'string' as const,
      required: true,
      min: 10,
      max: 1000,
      sanitize: true
    },
    category: {
      type: 'string' as const,
      required: true,
      enum: ['technical', 'billing', 'general', 'feature']
    }
  },
  
  // Profile update validation
  profileUpdate: {
    email: {
      type: 'email' as const,
      required: false,
      sanitize: true
    }
  }
} as const;

// Security headers helper
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
  };
}