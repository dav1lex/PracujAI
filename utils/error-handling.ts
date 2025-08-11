/**
 * Centralized error handling utilities with Polish error messages
 * @file utils/error-handling.ts
 */

import { POLISH_CONTENT } from './polish-content';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PAYMENT = 'payment',
  CREDIT = 'credit',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Custom error class with Polish messages
export class PolishError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly polishMessage: string;
  public readonly originalError?: Error;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    type: ErrorType,
    polishMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(polishMessage);
    this.name = 'PolishError';
    this.type = type;
    this.severity = severity;
    this.polishMessage = polishMessage;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.context = context;
  }
}

// Error message mapping for common errors
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: POLISH_CONTENT.errors.networkError,
  SERVER_ERROR: POLISH_CONTENT.errors.serverError,
  
  // Authentication errors
  INVALID_CREDENTIALS: POLISH_CONTENT.errors.invalidCredentials,
  EMAIL_ALREADY_EXISTS: POLISH_CONTENT.errors.emailAlreadyExists,
  WEAK_PASSWORD: POLISH_CONTENT.errors.weakPassword,
  PASSWORD_MISMATCH: POLISH_CONTENT.errors.passwordMismatch,
  EMAIL_NOT_VERIFIED: POLISH_CONTENT.errors.emailNotVerified,
  
  // Credit errors
  INSUFFICIENT_CREDITS: POLISH_CONTENT.errors.insufficientCredits,
  INVALID_AMOUNT: POLISH_CONTENT.errors.invalidAmount,
  TRANSACTION_FAILED: POLISH_CONTENT.errors.transactionFailed,
  
  // Payment errors
  PAYMENT_FAILED: POLISH_CONTENT.errors.paymentFailed,
  CARD_DECLINED: POLISH_CONTENT.errors.cardDeclined,
  INVALID_CARD: POLISH_CONTENT.errors.invalidCard,
  
  // Validation errors
  REQUIRED_FIELD: POLISH_CONTENT.errors.required,
  INVALID_EMAIL: POLISH_CONTENT.errors.invalidEmail,
  PASSWORD_TOO_SHORT: POLISH_CONTENT.errors.passwordTooShort,
  INVALID_PHONE: POLISH_CONTENT.errors.invalidPhoneNumber,
  
  // Generic errors
  SOMETHING_WENT_WRONG: POLISH_CONTENT.errors.somethingWentWrong
} as const;

// Error factory functions
export const createNetworkError = (originalError?: Error, context?: Record<string, any>) =>
  new PolishError(ErrorType.NETWORK, ERROR_MESSAGES.NETWORK_ERROR, ErrorSeverity.HIGH, originalError, context);

export const createAuthError = (message: string, originalError?: Error, context?: Record<string, any>) =>
  new PolishError(ErrorType.AUTHENTICATION, message, ErrorSeverity.MEDIUM, originalError, context);

export const createValidationError = (message: string, context?: Record<string, any>) =>
  new PolishError(ErrorType.VALIDATION, message, ErrorSeverity.LOW, undefined, context);

export const createPaymentError = (message: string, originalError?: Error, context?: Record<string, any>) =>
  new PolishError(ErrorType.PAYMENT, message, ErrorSeverity.HIGH, originalError, context);

export const createCreditError = (message: string, context?: Record<string, any>) =>
  new PolishError(ErrorType.CREDIT, message, ErrorSeverity.MEDIUM, undefined, context);

export const createServerError = (originalError?: Error, context?: Record<string, any>) =>
  new PolishError(ErrorType.SERVER, ERROR_MESSAGES.SERVER_ERROR, ErrorSeverity.HIGH, originalError, context);

// Error parsing utilities
export function parseSupabaseError(error: any): PolishError {
  const message = error?.message || '';
  
  if (message.includes('Invalid login credentials')) {
    return createAuthError(ERROR_MESSAGES.INVALID_CREDENTIALS, error);
  }
  
  if (message.includes('User already registered')) {
    return createAuthError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, error);
  }
  
  if (message.includes('Password should be at least')) {
    return createAuthError(ERROR_MESSAGES.WEAK_PASSWORD, error);
  }
  
  if (message.includes('Email not confirmed')) {
    return createAuthError(ERROR_MESSAGES.EMAIL_NOT_VERIFIED, error);
  }
  
  return createServerError(error);
}

export function parseStripeError(error: any): PolishError {
  const code = error?.code || '';
  const message = error?.message || '';
  
  switch (code) {
    case 'card_declined':
      return createPaymentError(ERROR_MESSAGES.CARD_DECLINED, error);
    case 'invalid_number':
    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
    case 'invalid_cvc':
      return createPaymentError(ERROR_MESSAGES.INVALID_CARD, error);
    case 'payment_intent_authentication_failure':
      return createPaymentError(ERROR_MESSAGES.PAYMENT_FAILED, error);
    default:
      return createPaymentError(ERROR_MESSAGES.PAYMENT_FAILED, error);
  }
}

export function parseNetworkError(error: any): PolishError {
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return createNetworkError(error);
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return createNetworkError(error);
  }
  
  return createServerError(error);
}

// Generic error parser
export function parseError(error: any): PolishError {
  if (error instanceof PolishError) {
    return error;
  }
  
  // Try to parse specific error types
  if (error?.code?.startsWith('stripe_')) {
    return parseStripeError(error);
  }
  
  if (error?.message?.includes('supabase') || error?.code?.includes('PGRST')) {
    return parseSupabaseError(error);
  }
  
  if (error?.name === 'TypeError' || error?.code === 'NETWORK_ERROR') {
    return parseNetworkError(error);
  }
  
  // Default to generic error
  return new PolishError(
    ErrorType.UNKNOWN,
    ERROR_MESSAGES.SOMETHING_WENT_WRONG,
    ErrorSeverity.MEDIUM,
    error
  );
}

// Error logging utility
export function logError(error: PolishError): void {
  const logData = {
    type: error.type,
    severity: error.severity,
    message: error.polishMessage,
    originalMessage: error.originalError?.message,
    timestamp: error.timestamp,
    context: error.context,
    stack: error.originalError?.stack
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Polish Error:', logData);
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement production error logging
    // Example: Sentry.captureException(error, { extra: logData });
  }
}

// Error reporting utility for user feedback
export function shouldShowErrorToUser(error: PolishError): boolean {
  // Don't show critical system errors to users
  if (error.severity === ErrorSeverity.CRITICAL) {
    return false;
  }
  
  // Always show validation and user-facing errors
  if (error.type === ErrorType.VALIDATION || error.type === ErrorType.AUTHENTICATION) {
    return true;
  }
  
  return true;
}

// Get user-friendly error message
export function getUserErrorMessage(error: PolishError): string {
  if (shouldShowErrorToUser(error)) {
    return error.polishMessage;
  }
  
  return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
}