/**
 * Custom hook for form state management with validation
 * @file hooks/useForm.ts
 */

import { useState, useCallback, useMemo } from 'react';
import { ValidationSchema, validateForm, validateField, ValidationResult } from '@/utils/validation';
import { useErrorHandler } from './useErrorHandler';
import { useNotifications } from '@/contexts/NotificationContext';

interface UseFormOptions {
  initialData?: Record<string, any>;
  validation?: ValidationSchema;
  onSubmit?: (data: Record<string, any>) => Promise<void> | void;
  successMessage?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn {
  // Form data
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  
  // Form actions
  setValue: (name: string, value: any) => void;
  setValues: (values: Record<string, any>) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  clearAllErrors: () => void;
  setTouched: (name: string, touched?: boolean) => void;
  reset: (newData?: Record<string, any>) => void;
  
  // Field handlers
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  
  // Validation
  validateField: (name: string) => boolean;
  validateForm: () => boolean;
  
  // Utilities
  getFieldProps: (name: string) => {
    name: string;
    value: any;
    onChange: (name: string, value: any) => void;
    onBlur: (name: string) => void;
    error?: string;
    disabled: boolean;
  };
}

export function useForm({
  initialData = {},
  validation,
  onSubmit,
  successMessage,
  validateOnChange = false,
  validateOnBlur = true
}: UseFormOptions = {}): UseFormReturn {
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleFormError } = useErrorHandler();
  const { showSuccess } = useNotifications();

  // Check if form is valid
  const isValid = useMemo(() => {
    if (!validation) return true;
    const result = validateForm(data, validation);
    return result.isValid;
  }, [data, validation]);

  // Set single field value
  const setValue = useCallback((name: string, value: any) => {
    setData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when value changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Validate on change if enabled
    if (validateOnChange && validation && validation[name] && touched[name]) {
      const result = validateField(value, validation[name]);
      if (!result.isValid && result.error) {
        setErrors(prev => ({ ...prev, [name]: result.error! }));
      }
    }
  }, [errors, validateOnChange, validation, touched]);

  // Set multiple field values
  const setValues = useCallback((values: Record<string, any>) => {
    setData(prev => ({ ...prev, ...values }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(values);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field];
        }
      });
      return newErrors;
    });
  }, []);

  // Set field error
  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Clear field error
  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Set field touched state
  const setTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // Reset form
  const reset = useCallback((newData?: Record<string, any>) => {
    const resetData = newData || initialData;
    setData(resetData);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialData]);

  // Handle field change
  const handleChange = useCallback((name: string, value: any) => {
    setValue(name, value);
  }, [setValue]);

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setTouched(name, true);
    
    // Validate on blur if enabled
    if (validateOnBlur && validation && validation[name]) {
      const result = validateField(data[name], validation[name]);
      if (!result.isValid && result.error) {
        setError(name, result.error);
      }
    }
  }, [validateOnBlur, validation, data, setTouched, setError]);

  // Validate single field
  const validateSingleField = useCallback((name: string): boolean => {
    if (!validation || !validation[name]) return true;
    
    const result = validateField(data[name], validation[name]);
    if (!result.isValid && result.error) {
      setError(name, result.error);
      return false;
    }
    
    clearError(name);
    return true;
  }, [validation, data, setError, clearError]);

  // Validate entire form
  const validateEntireForm = useCallback((): boolean => {
    if (!validation) return true;
    
    const result = validateForm(data, validation);
    setErrors(result.errors);
    
    // Mark all fields as touched
    const allFields = Object.keys(validation);
    const allTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouchedState(prev => ({ ...prev, ...allTouched }));
    
    return result.isValid;
  }, [validation, data]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (isSubmitting) return;
    
    // Validate form
    const isFormValid = validateEntireForm();
    if (!isFormValid) return;
    
    if (!onSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      
      if (successMessage) {
        showSuccess(successMessage);
      }
      
      // Reset touched state on successful submission
      setTouchedState({});
    } catch (error) {
      handleFormError(error, 'form-submission');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateEntireForm, onSubmit, data, successMessage, showSuccess, handleFormError]);

  // Get field props for easy integration
  const getFieldProps = useCallback((name: string) => ({
    name,
    value: data[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    disabled: isSubmitting
  }), [data, handleChange, handleBlur, errors, isSubmitting]);

  return {
    // Form state
    data,
    errors,
    touched,
    isSubmitting,
    isValid,
    
    // Form actions
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    setTouched,
    reset,
    
    // Field handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Validation
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    
    // Utilities
    getFieldProps
  };
}

// Hook for handling async form submissions with loading states
export function useAsyncForm(options: UseFormOptions & {
  onSubmit: (data: Record<string, any>) => Promise<any>;
}) {
  const form = useForm(options);
  
  return {
    ...form,
    submitAsync: async (data?: Record<string, any>) => {
      // Use the built-in handleSubmit which manages loading state
      await form.handleSubmit();
      return form.data;
    }
  };
}