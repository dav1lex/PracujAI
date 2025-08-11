/**
 * Loading spinner components with Polish loading messages
 * @file components/LoadingSpinner.tsx
 */

import { POLISH_CONTENT } from '@/utils/polish-content';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

// Main loading spinner component
export default function LoadingSpinner({ 
  size = 'md', 
  message = POLISH_CONTENT.loading.loading,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} mx-auto`}></div>
        {message && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Inline loading spinner for buttons
export function InlineSpinner({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${className}`}></div>
  );
}

// Button loading state component
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function LoadingButton({ 
  loading, 
  children, 
  loadingText = POLISH_CONTENT.loading.loading,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const disabledClasses = "opacity-50 cursor-not-allowed";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${disabled || loading ? disabledClasses : ''} ${className}`}
    >
      {loading && (
        <InlineSpinner size="sm" className="mr-2" />
      )}
      {loading ? loadingText : children}
    </button>
  );
}

// Form loading overlay
export function FormLoadingOverlay({ message = POLISH_CONTENT.loading.processing }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}

// Page loading skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
        
        {/* Card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress bar component
interface ProgressBarProps {
  progress: number; // 0-100
  message?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  message, 
  showPercentage = true, 
  className = '' 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={`w-full ${className}`}>
      {(message || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {message && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}

// Dots loading indicator
export function DotsLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
} 