'use client';

import React from 'react';
import { useForm } from '@/hooks/useForm';
import { commonSchemas } from '@/utils/validation';
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from './FormInput';
import { Form, FormSection, FormActions, SuccessMessage } from './Form';
import { LoadingButton } from '@/components/LoadingSpinner';
import { POLISH_CONTENT } from '@/utils/polish-content';

// Example contact form component
export function ContactForm() {
  const form = useForm({
    validation: commonSchemas.contact,
    successMessage: POLISH_CONTENT.help.messageSent,
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Contact form submitted:', data);
    }
  });

  const categoryOptions = [
    { value: 'technical', label: POLISH_CONTENT.help.technical },
    { value: 'billing', label: POLISH_CONTENT.help.billing },
    { value: 'general', label: POLISH_CONTENT.help.general },
    { value: 'feature', label: POLISH_CONTENT.help.feature }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {POLISH_CONTENT.help.contactForm}
      </h2>
      
      <Form
        onSubmit={form.handleSubmit}
        className="space-y-6"
      >
        <FormSection
          title="Informacje o zapytaniu"
          description="Wypełnij poniższe pola, aby wysłać zapytanie do naszego zespołu wsparcia."
        >
          <FormSelect
            {...form.getFieldProps('category')}
            label={POLISH_CONTENT.help.category}
            options={categoryOptions}
            required
            validation={commonSchemas.contact.category}
          />
          
          <FormInput
            {...form.getFieldProps('subject')}
            label={POLISH_CONTENT.help.subject}
            placeholder="Krótko opisz problem lub pytanie"
            required
            validation={commonSchemas.contact.subject}
          />
          
          <FormTextarea
            {...form.getFieldProps('message')}
            label={POLISH_CONTENT.help.message}
            placeholder="Opisz szczegółowo swoje zapytanie..."
            rows={6}
            required
            validation={commonSchemas.contact.message}
          />
        </FormSection>
        
        <FormActions>
          <button
            type="button"
            onClick={() => form.reset()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            disabled={form.isSubmitting}
          >
            {POLISH_CONTENT.actions.cancel}
          </button>
          
          <LoadingButton
            type="submit"
            loading={form.isSubmitting}
            loadingText={POLISH_CONTENT.loading.sending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {POLISH_CONTENT.help.sendMessage}
          </LoadingButton>
        </FormActions>
      </Form>
    </div>
  );
}

// Example registration form component
export function RegistrationForm() {
  const form = useForm({
    validation: {
      ...commonSchemas.register,
      confirmPassword: {
        required: true,
        custom: (value: string) => value === form.data.password,
        customMessage: POLISH_CONTENT.errors.passwordMismatch
      },
      acceptTerms: {
        required: true,
        custom: (value: boolean) => value === true,
        customMessage: 'Musisz zaakceptować regulamin'
      }
    },
    successMessage: POLISH_CONTENT.success.accountCreated,
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registration form submitted:', data);
    }
  });

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        {POLISH_CONTENT.auth.register}
      </h2>
      
      <Form
        onSubmit={form.handleSubmit}
        className="space-y-4"
      >
        <FormInput
          {...form.getFieldProps('email')}
          type="email"
          label={POLISH_CONTENT.auth.email}
          placeholder="twoj@email.com"
          required
          autoComplete="email"
          validation={commonSchemas.register.email}
        />
        
        <FormInput
          {...form.getFieldProps('password')}
          type="password"
          label={POLISH_CONTENT.auth.password}
          placeholder="Minimum 8 znaków"
          required
          autoComplete="new-password"
          validation={commonSchemas.register.password}
        />
        
        <FormInput
          {...form.getFieldProps('confirmPassword')}
          type="password"
          label={POLISH_CONTENT.auth.confirmPassword}
          placeholder="Powtórz hasło"
          required
          autoComplete="new-password"
          validation={{
            required: true,
            custom: (value: string) => value === form.data.password,
            customMessage: POLISH_CONTENT.errors.passwordMismatch
          }}
        />
        
        <FormCheckbox
          {...form.getFieldProps('acceptTerms')}
          label="Akceptuję regulamin i politykę prywatności"
          required
          validation={{
            required: true,
            custom: (value: boolean) => value === true,
            customMessage: 'Musisz zaakceptować regulamin'
          }}
        />
        
        <FormActions align="center">
          <LoadingButton
            type="submit"
            loading={form.isSubmitting}
            loadingText={POLISH_CONTENT.loading.processing}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {POLISH_CONTENT.auth.registerButton}
          </LoadingButton>
        </FormActions>
      </Form>
      
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {POLISH_CONTENT.auth.alreadyHaveAccount}{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
          {POLISH_CONTENT.auth.login}
        </a>
      </p>
    </div>
  );
}

// Example login form component
export function LoginForm() {
  const form = useForm({
    validation: commonSchemas.login,
    onSubmit: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login form submitted:', data);
    }
  });

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        {POLISH_CONTENT.auth.login}
      </h2>
      
      <Form
        onSubmit={form.handleSubmit}
        className="space-y-4"
      >
        <FormInput
          {...form.getFieldProps('email')}
          type="email"
          label={POLISH_CONTENT.auth.email}
          placeholder="twoj@email.com"
          required
          autoComplete="email"
          validation={commonSchemas.login.email}
        />
        
        <FormInput
          {...form.getFieldProps('password')}
          type="password"
          label={POLISH_CONTENT.auth.password}
          placeholder="Twoje hasło"
          required
          autoComplete="current-password"
          validation={commonSchemas.login.password}
        />
        
        <div className="flex items-center justify-between">
          <FormCheckbox
            {...form.getFieldProps('rememberMe')}
            label="Zapamiętaj mnie"
          />
          
          <a 
            href="/reset-password" 
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {POLISH_CONTENT.auth.forgotPassword}
          </a>
        </div>
        
        <FormActions align="center">
          <LoadingButton
            type="submit"
            loading={form.isSubmitting}
            loadingText={POLISH_CONTENT.loading.authenticating}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {POLISH_CONTENT.auth.loginButton}
          </LoadingButton>
        </FormActions>
      </Form>
      
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {POLISH_CONTENT.auth.dontHaveAccount}{' '}
        <a href="/register" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
          {POLISH_CONTENT.auth.register}
        </a>
      </p>
    </div>
  );
}