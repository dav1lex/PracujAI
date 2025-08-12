'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { ValidationSchema, validateForm, ValidationResult } from '@/utils/validation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { LoadingButton, FormLoadingOverlay } from '@/components/LoadingSpinner';
import { POLISH_CONTENT } from '@/utils/polish-content';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
  validation?: ValidationSchema;
  initialData?: Record<string, unknown>;
  submitText?: string;
  submitLoadingText?: string;
  successMessage?: string;
  className?: string;
  disabled?: boolean;
  showLoadingOverlay?: boolean;
}

export function Form({
  children,
  onSubmit,
  validation,
  initialData = {},
  submitLoadingText = POLISH_CONTENT.loading.saving,
  successMessage,
  className = '',
  disabled = false,
  showLoadingOverlay = false
}: FormProps) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleFormError } = useErrorHandler();
  const { showSuccess } = useNotifications();

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleFieldBlur = useCallback((name: string) => {
    // Validate single field on blur
    if (validation && validation[name]) {
      const fieldValidation = { [name]: validation[name] };
      const result = validateForm({ [name]: data[name] }, fieldValidation);

      if (!result.isValid) {
        setErrors(prev => ({ ...prev, ...result.errors }));
      }
    }
  }, [validation, data]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    if (disabled || isSubmitting) return;

    // Validate all fields
    let validationResult: ValidationResult = { isValid: true, errors: {} };
    if (validation) {
      validationResult = validateForm(data, validation);
      setErrors(validationResult.errors);
    }

    if (!validationResult.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(data);

      if (successMessage) {
        showSuccess(successMessage);
      }

      // Reset form state on successful submission
      setErrors({});
    } catch (error) {
      handleFormError(error, 'form-submission');
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validation, disabled, isSubmitting, onSubmit, successMessage, showSuccess, handleFormError]);

  // Clone children and inject form props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as Record<string, unknown>;

      // Check if child is a form input component
      if (childProps.name && typeof childProps.name === 'string') {
        return React.cloneElement(child, {
          value: data[childProps.name] || '',
          onChange: handleFieldChange,
          onBlur: handleFieldBlur,
          error: errors[childProps.name],
          disabled: disabled || isSubmitting,
          ...childProps
        } as any);
      }

      // Check if child is a submit button
      if (childProps.type === 'submit' || child.type === LoadingButton) {
        return React.cloneElement(child, {
          loading: isSubmitting,
          disabled: disabled || isSubmitting,
          loadingText: submitLoadingText,
          ...childProps
        } as any);
      }
    }

    return child;
  });

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} noValidate>
      {showLoadingOverlay && isSubmitting && (
        <FormLoadingOverlay message={submitLoadingText} />
      )}

      <div className="space-y-4">
        {enhancedChildren}
      </div>
    </form>
  );
}

// Success message component
interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessMessage({ message, onDismiss, className = '' }: SuccessMessageProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-800">
            {message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none focus:text-green-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Form section component for organizing form fields
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Form actions component for submit/cancel buttons
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function FormActions({ children, className = '', align = 'right' }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}