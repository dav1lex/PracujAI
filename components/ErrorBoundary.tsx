'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { PolishError, ErrorType, ErrorSeverity, logError } from '@/utils/error-handling';
import { POLISH_CONTENT } from '@/utils/polish-content';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: PolishError;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Convert the error to a PolishError
    const polishError = new PolishError(
      ErrorType.UNKNOWN,
      POLISH_CONTENT.errors.somethingWentWrong,
      ErrorSeverity.HIGH,
      error
    );

    return {
      hasError: true,
      error: polishError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    const polishError = new PolishError(
      ErrorType.UNKNOWN,
      POLISH_CONTENT.errors.somethingWentWrong,
      ErrorSeverity.HIGH,
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    );

    logError(polishError);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              {/* Error icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error title */}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {POLISH_CONTENT.errors.somethingWentWrong}
              </h1>

              {/* Error message */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {this.state.error?.polishMessage || 'Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.'}
              </p>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {POLISH_CONTENT.errors.tryAgain}
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {POLISH_CONTENT.actions.refresh}
                </button>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error?.originalError && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    Szczegóły błędu (tylko w trybie deweloperskim)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto text-gray-800 dark:text-gray-200">
                    {this.state.error.originalError.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    const polishError = new PolishError(
      ErrorType.UNKNOWN,
      POLISH_CONTENT.errors.somethingWentWrong,
      ErrorSeverity.HIGH,
      error,
      errorInfo
    );

    logError(polishError);
    
    // In a real app, you might want to show a notification or redirect
    throw polishError;
  };
}