/**
 * Custom hook for centralized error handling with Polish messages
 * @file hooks/useErrorHandler.ts
 */

import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  parseError, 
  logError, 
  getUserErrorMessage, 
  PolishError,
  ErrorType,
  createNetworkError,
  createAuthError,
  createValidationError,
  createPaymentError,
  createCreditError,
  createServerError
} from '@/utils/error-handling';

export function useErrorHandler() {
  const { showError, showWarning } = useNotifications();

  // Main error handler
  const handleError = useCallback((error: any, context?: Record<string, any>) => {
    const polishError = parseError(error);
    
    // Add context if provided
    if (context) {
      polishError.context = { ...polishError.context, ...context };
    }

    // Log the error
    logError(polishError);

    // Show user-friendly notification
    const userMessage = getUserErrorMessage(polishError);
    showError(polishError, undefined, polishError.severity === 'critical' ? 0 : undefined);

    return polishError;
  }, [showError]);

  // Specific error handlers
  const handleNetworkError = useCallback((error: any, context?: Record<string, any>) => {
    const networkError = createNetworkError(error, context);
    logError(networkError);
    showError(networkError);
    return networkError;
  }, [showError]);

  const handleAuthError = useCallback((message: string, error?: any, context?: Record<string, any>) => {
    const authError = createAuthError(message, error, context);
    logError(authError);
    showError(authError);
    return authError;
  }, [showError]);

  const handleValidationError = useCallback((message: string, context?: Record<string, any>) => {
    const validationError = createValidationError(message, context);
    logError(validationError);
    showWarning(message); // Use warning for validation errors
    return validationError;
  }, [showWarning]);

  const handlePaymentError = useCallback((message: string, error?: any, context?: Record<string, any>) => {
    const paymentError = createPaymentError(message, error, context);
    logError(paymentError);
    showError(paymentError);
    return paymentError;
  }, [showError]);

  const handleCreditError = useCallback((message: string, context?: Record<string, any>) => {
    const creditError = createCreditError(message, context);
    logError(creditError);
    showError(creditError);
    return creditError;
  }, [showError]);

  const handleServerError = useCallback((error: any, context?: Record<string, any>) => {
    const serverError = createServerError(error, context);
    logError(serverError);
    showError(serverError);
    return serverError;
  }, [showError]);

  // Async operation wrapper with error handling
  const withErrorHandling = useCallback(<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ) => {
    return async (): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    };
  }, [handleError]);

  // Form submission wrapper with error handling
  const handleFormError = useCallback((error: any, formName?: string) => {
    const context = formName ? { form: formName } : undefined;
    return handleError(error, context);
  }, [handleError]);

  // API call wrapper with error handling
  const handleApiError = useCallback((error: any, endpoint?: string, method?: string) => {
    const context = { 
      endpoint, 
      method,
      apiCall: true 
    };
    return handleError(error, context);
  }, [handleError]);

  return {
    // Main handlers
    handleError,
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    handlePaymentError,
    handleCreditError,
    handleServerError,
    
    // Utility wrappers
    withErrorHandling,
    handleFormError,
    handleApiError
  };
}

// Hook for handling async operations with loading states
export function useAsyncOperation() {
  const { handleError } = useErrorHandler();
  const { showSuccess } = useNotifications();

  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorContext?: Record<string, any>;
      onSuccess?: (result: T) => void;
      onError?: (error: PolishError) => void;
    }
  ): Promise<{ data: T | null; error: PolishError | null }> => {
    try {
      const result = await operation();
      
      if (options?.successMessage) {
        showSuccess(options.successMessage);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return { data: result, error: null };
    } catch (error) {
      const polishError = handleError(error, options?.errorContext);
      
      if (options?.onError) {
        options.onError(polishError);
      }
      
      return { data: null, error: polishError };
    }
  }, [handleError, showSuccess]);

  return { executeAsync };
}