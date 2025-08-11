'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { POLISH_CONTENT } from '@/utils/polish-content';
import { CreditCard, Download, User, Settings, LogOut, Menu, X } from 'lucide-react';

// TopBar component handles user profile display and navigation
export default function TopBar() {
  const { user, signOut } = useAuth();
  const { handleError } = useErrorHandler();
  const { showSuccess } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user logout with error handling and loading state
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setIsDropdownOpen(false);
      showSuccess('Pomyślnie wylogowano');
    } catch (error) {
      handleError(error, { action: 'logout' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <Link 
          href="/" 
          className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">💼</span>
          <span className="font-sans">PracujMatcher</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {POLISH_CONTENT.nav.home}
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {POLISH_CONTENT.nav.dashboard}
              </Link>
              <Link
                href="/pricing"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/pricing' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {POLISH_CONTENT.nav.pricing}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {POLISH_CONTENT.nav.login}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {POLISH_CONTENT.nav.register}
              </Link>
            </>
          ) : (
            <>
              {/* Quick action buttons for authenticated users */}
              {pathname === '/dashboard' && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  {POLISH_CONTENT.credits.buyCredits}
                </button>
              )}
              
              {pathname === '/' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {POLISH_CONTENT.dashboard.downloadApp}
                </button>
              )}

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.email}
                  </span>
                  <svg 
                    className="w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    {/* User info section */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Konto aktywne
                      </p>
                    </div>

                    {/* Navigation links */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      {POLISH_CONTENT.nav.dashboard}
                    </Link>
                    
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      {POLISH_CONTENT.nav.profile}
                    </Link>

                    <Link
                      href="/pricing"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <CreditCard className="h-4 w-4" />
                      {POLISH_CONTENT.nav.pricing}
                    </Link>

                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? POLISH_CONTENT.loading.processing : POLISH_CONTENT.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden z-40">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/' 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {POLISH_CONTENT.nav.home}
              </Link>
              
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/dashboard' 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {POLISH_CONTENT.nav.dashboard}
                  </Link>
                  
                  <Link
                    href="/pricing"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/pricing' 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {POLISH_CONTENT.nav.pricing}
                  </Link>
                </>
              )}

              {!user && (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {POLISH_CONTENT.nav.login}
                  </Link>
                  
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {POLISH_CONTENT.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 