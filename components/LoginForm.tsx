'use client';

import { useState } from 'react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  onSubmit: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function LoginForm({ 
  onSubmit, 
  isLoading, 
  error 
}: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, isSignUp);
  };

  return (
    <div className="w-full space-y-8 p-8 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-subtle border border-gray-200 dark:border-gray-700">
      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isSignUp ? 'Create an account' : 'Are you an Email User?'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-md shadow-sm space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        <ForgotPasswordModal 
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-2.5 px-4 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        >
          {isSignUp ? 'Sign up' : 'Sign in'} with Email
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
}