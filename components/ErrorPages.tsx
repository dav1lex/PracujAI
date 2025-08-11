'use client';

import React from 'react';
import { POLISH_CONTENT } from '@/utils/polish-content';

interface ErrorPageProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
}

// Generic error page component
export function ErrorPage({ 
  title = POLISH_CONTENT.errors.somethingWentWrong,
  message = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie za chwilę.',
  showRetry = true,
  showHome = true,
  onRetry,
  onHome
}: ErrorPageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error illustration */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error content */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action buttons */}
        <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
          {showRetry && (
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {POLISH_CONTENT.errors.tryAgain}
            </button>
          )}
          
          {showHome && (
            <button
              onClick={handleHome}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {POLISH_CONTENT.nav.home}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 404 Not Found page
export function NotFoundPage() {
  return (
    <ErrorPage
      title="Strona nie została znaleziona"
      message="Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona."
      showRetry={false}
      showHome={true}
    />
  );
}

// Network error page
export function NetworkErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="Błąd połączenia"
      message={POLISH_CONTENT.errors.networkError}
      showRetry={true}
      showHome={true}
      onRetry={onRetry}
    />
  );
}

// Server error page
export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="Błąd serwera"
      message={POLISH_CONTENT.errors.serverError}
      showRetry={true}
      showHome={true}
      onRetry={onRetry}
    />
  );
}

// Authentication error page
export function AuthErrorPage() {
  return (
    <ErrorPage
      title="Błąd uwierzytelniania"
      message="Wystąpił problem z uwierzytelnianiem. Zaloguj się ponownie."
      showRetry={false}
      showHome={false}
      onHome={() => window.location.href = '/login'}
    />
  );
}

// Payment error page
export function PaymentErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="Błąd płatności"
      message={POLISH_CONTENT.errors.paymentFailed}
      showRetry={true}
      showHome={true}
      onRetry={onRetry}
    />
  );
}

// Maintenance page
export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Maintenance illustration */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Maintenance content */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Prace konserwacyjne
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Przeprowadzamy prace konserwacyjne w celu poprawy jakości usług. 
          Wrócimy wkrótce!
        </p>

        {/* Status indicator */}
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          Trwają prace konserwacyjne
        </div>
      </div>
    </div>
  );
}