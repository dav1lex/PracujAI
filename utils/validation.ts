/**
 * Form validation utilities with Polish error messages
 * @file utils/validation.ts
 */

import { POLISH_CONTENT } from './polish-content';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Field validation result
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Validation rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  customMessage?: string;
}

// Validation schema
export type ValidationSchema = Record<string, ValidationRule>;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Polish format)
const PHONE_REGEX = /^(\+48\s?)?(\d{3}\s?\d{3}\s?\d{3}|\d{2}\s?\d{3}\s?\d{2}\s?\d{2})$/;

// Password strength regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Basic validation functions
export const validators = {
  required: (value: any): FieldValidationResult => {
    const isEmpty = value === null || value === undefined || 
                   (typeof value === 'string' && value.trim() === '') ||
                   (Array.isArray(value) && value.length === 0);
    
    return {
      isValid: !isEmpty,
      error: isEmpty ? POLISH_CONTENT.errors.required : undefined
    };
  },

  email: (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    const isValid = EMAIL_REGEX.test(value);
    return {
      isValid,
      error: isValid ? undefined : POLISH_CONTENT.errors.invalidEmail
    };
  },

  minLength: (minLength: number) => (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    const isValid = value.length >= minLength;
    return {
      isValid,
      error: isValid ? undefined : `Pole musi mieć co najmniej ${minLength} znaków`
    };
  },

  maxLength: (maxLength: number) => (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    const isValid = value.length <= maxLength;
    return {
      isValid,
      error: isValid ? undefined : `Pole może mieć maksymalnie ${maxLength} znaków`
    };
  },

  password: (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    if (value.length < 8) {
      return {
        isValid: false,
        error: POLISH_CONTENT.errors.passwordTooShort
      };
    }
    
    return { isValid: true };
  },

  strongPassword: (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    const isValid = STRONG_PASSWORD_REGEX.test(value);
    return {
      isValid,
      error: isValid ? undefined : 'Hasło musi zawierać co najmniej 8 znaków, jedną wielką literę, jedną małą literę i jedną cyfrę'
    };
  },

  confirmPassword: (password: string) => (confirmPassword: string): FieldValidationResult => {
    if (!confirmPassword) return { isValid: true }; // Allow empty if not required
    
    const isValid = password === confirmPassword;
    return {
      isValid,
      error: isValid ? undefined : POLISH_CONTENT.errors.passwordMismatch
    };
  },

  phone: (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    const isValid = PHONE_REGEX.test(value);
    return {
      isValid,
      error: isValid ? undefined : POLISH_CONTENT.errors.invalidPhoneNumber
    };
  },

  pattern: (pattern: RegExp, message: string) => (value: string): FieldValidationResult => {
    if (!value) return { isValid: true }; // Allow empty if not required
    
    const isValid = pattern.test(value);
    return {
      isValid,
      error: isValid ? undefined : message
    };
  },

  custom: (validatorFn: (value: any) => boolean, message: string) => (value: any): FieldValidationResult => {
    const isValid = validatorFn(value);
    return {
      isValid,
      error: isValid ? undefined : message
    };
  }
};

// Validate a single field
export function validateField(value: any, rules: ValidationRule): FieldValidationResult {
  // Check required first
  if (rules.required) {
    const requiredResult = validators.required(value);
    if (!requiredResult.isValid) {
      return requiredResult;
    }
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: true };
  }

  // Check min length
  if (rules.minLength && typeof value === 'string') {
    const result = validators.minLength(rules.minLength)(value);
    if (!result.isValid) return result;
  }

  // Check max length
  if (rules.maxLength && typeof value === 'string') {
    const result = validators.maxLength(rules.maxLength)(value);
    if (!result.isValid) return result;
  }

  // Check pattern
  if (rules.pattern && typeof value === 'string') {
    const isValid = rules.pattern.test(value);
    if (!isValid) {
      return {
        isValid: false,
        error: rules.customMessage || 'Nieprawidłowy format'
      };
    }
  }

  // Check custom validation
  if (rules.custom) {
    const isValid = rules.custom(value);
    if (!isValid) {
      return {
        isValid: false,
        error: rules.customMessage || 'Nieprawidłowa wartość'
      };
    }
  }

  return { isValid: true };
}

// Validate entire form
export function validateForm(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = data[fieldName];
    const result = validateField(fieldValue, rules);
    
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

// Common validation schemas
export const commonSchemas = {
  // Login form
  login: {
    email: {
      required: true,
      pattern: EMAIL_REGEX,
      customMessage: POLISH_CONTENT.errors.invalidEmail
    },
    password: {
      required: true,
      minLength: 1
    }
  } as ValidationSchema,

  // Registration form
  register: {
    email: {
      required: true,
      pattern: EMAIL_REGEX,
      customMessage: POLISH_CONTENT.errors.invalidEmail
    },
    password: {
      required: true,
      minLength: 8,
      customMessage: POLISH_CONTENT.errors.passwordTooShort
    },
    confirmPassword: {
      required: true
    }
  } as ValidationSchema,

  // Password change form
  changePassword: {
    currentPassword: {
      required: true
    },
    newPassword: {
      required: true,
      minLength: 8,
      customMessage: POLISH_CONTENT.errors.passwordTooShort
    },
    confirmNewPassword: {
      required: true
    }
  } as ValidationSchema,

  // Profile update form
  profile: {
    email: {
      required: true,
      pattern: EMAIL_REGEX,
      customMessage: POLISH_CONTENT.errors.invalidEmail
    }
  } as ValidationSchema,

  // Contact form
  contact: {
    subject: {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000
    },
    category: {
      required: true
    }
  } as ValidationSchema,

  // Credit purchase form
  creditPurchase: {
    package: {
      required: true,
      custom: (value: string) => ['100', '200', '500'].includes(value),
      customMessage: 'Wybierz prawidłowy pakiet kredytów'
    }
  } as ValidationSchema
};

// Real-time validation hook
export function useFormValidation(schema: ValidationSchema) {
  const validateSingleField = (fieldName: string, value: any) => {
    const rules = schema[fieldName];
    if (!rules) return { isValid: true };
    
    return validateField(value, rules);
  };

  const validateAllFields = (data: Record<string, any>) => {
    return validateForm(data, schema);
  };

  return {
    validateField: validateSingleField,
    validateForm: validateAllFields
  };
}

// Validation message helpers
export function getFieldError(errors: Record<string, string>, fieldName: string): string | undefined {
  return errors[fieldName];
}

export function hasFieldError(errors: Record<string, string>, fieldName: string): boolean {
  return Boolean(errors[fieldName]);
}

export function clearFieldError(errors: Record<string, string>, fieldName: string): Record<string, string> {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}