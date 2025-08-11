'use client';

import React, { useState, useCallback } from 'react';
import { ValidationRule, validateField } from '@/utils/validation';
import { POLISH_CONTENT } from '@/utils/polish-content';

interface FormInputProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  validation?: ValidationRule;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showValidation?: boolean;
  autoComplete?: string;
}

export function FormInput({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validation,
  error,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  showValidation = true,
  autoComplete
}: FormInputProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(name, newValue);

    // Real-time validation
    if (validation && touched && showValidation) {
      const result = validateField(newValue, validation);
      setLocalError(result.error);
    }
  }, [name, onChange, validation, touched, showValidation]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    
    // Validate on blur
    if (validation && showValidation) {
      const result = validateField(value, validation);
      setLocalError(result.error);
    }

    if (onBlur) {
      onBlur(name);
    }
  }, [name, value, validation, showValidation, onBlur]);

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    dark:bg-gray-800 dark:border-gray-600 dark:text-white
    dark:disabled:bg-gray-700
    transition-colors
    ${hasError 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600'
    }
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={inputClasses}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}

interface FormTextareaProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  validation?: ValidationRule;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
  showValidation?: boolean;
}

export function FormTextarea({
  name,
  label,
  value,
  onChange,
  onBlur,
  validation,
  error,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  showValidation = true
}: FormTextareaProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(name, newValue);

    // Real-time validation
    if (validation && touched && showValidation) {
      const result = validateField(newValue, validation);
      setLocalError(result.error);
    }
  }, [name, onChange, validation, touched, showValidation]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    
    // Validate on blur
    if (validation && showValidation) {
      const result = validateField(value, validation);
      setLocalError(result.error);
    }

    if (onBlur) {
      onBlur(name);
    }
  }, [name, value, validation, showValidation, onBlur]);

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  const textareaClasses = `
    w-full px-3 py-2 border rounded-lg text-sm resize-vertical
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    dark:bg-gray-800 dark:border-gray-600 dark:text-white
    dark:disabled:bg-gray-700
    transition-colors
    ${hasError 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600'
    }
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  validation?: ValidationRule;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showValidation?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function FormSelect({
  name,
  label,
  value,
  onChange,
  onBlur,
  validation,
  error,
  disabled = false,
  required = false,
  className = '',
  showValidation = true,
  options,
  placeholder = 'Wybierz opcję...'
}: FormSelectProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(name, newValue);

    // Real-time validation
    if (validation && touched && showValidation) {
      const result = validateField(newValue, validation);
      setLocalError(result.error);
    }
  }, [name, onChange, validation, touched, showValidation]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    
    // Validate on blur
    if (validation && showValidation) {
      const result = validateField(value, validation);
      setLocalError(result.error);
    }

    if (onBlur) {
      onBlur(name);
    }
  }, [name, value, validation, showValidation, onBlur]);

  const displayError = error || localError;
  const hasError = Boolean(displayError);

  const selectClasses = `
    w-full px-3 py-2 border rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    dark:bg-gray-800 dark:border-gray-600 dark:text-white
    dark:disabled:bg-gray-700
    transition-colors
    ${hasError 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600'
    }
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={selectClasses}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}

interface FormCheckboxProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (name: string, checked: boolean) => void;
  validation?: ValidationRule;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  description?: string;
}

export function FormCheckbox({
  name,
  label,
  checked,
  onChange,
  validation,
  error,
  disabled = false,
  required = false,
  className = '',
  description
}: FormCheckboxProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.checked);
  }, [name, onChange]);

  const hasError = Boolean(error);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`
            mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded
            focus:ring-blue-500 focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            dark:border-gray-600 dark:bg-gray-800
            ${hasError ? 'border-red-500' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        <div className="ml-3">
          <label 
            htmlFor={name}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {hasError && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400 ml-7"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}