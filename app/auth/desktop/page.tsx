'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

const DesktopAuthPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const handleDesktopAuth = async () => {
      try {
        const redirectUrlParam = searchParams.get('redirect_url') || 'pracujmatcher://auth';
        setRedirectUrl(redirectUrlParam);

        // Generate desktop authentication token
        const response = await fetch('/api/auth/desktop-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            redirectUrl: redirectUrlParam
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Błąd podczas uwierzytelniania');
        }

        setStatus('success');
        setMessage('Uwierzytelnianie zakończone pomyślnie. Przekierowywanie do aplikacji...');

        // Redirect to desktop application
        setTimeout(() => {
          window.location.href = result.data.redirectUrl;
        }, 2000);

      } catch (error) {
        console.error('Desktop auth error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Nieznany błąd');
      }
    };

    handleDesktopAuth();
  }, [searchParams]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('');
    window.location.reload();
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Uwierzytelnianie aplikacji
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Łączenie z aplikacją PracujMatcher
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Uwierzytelnianie...
              </h3>
              <p className="text-gray-600">
                Generowanie tokenu dostępu dla aplikacji desktop
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sukces!
              </h3>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-700">
                  Jeśli aplikacja nie otworzyła się automatycznie, kliknij poniższy link:
                </p>
                <a
                  href={redirectUrl}
                  className="inline-flex items-center mt-2 text-sm text-green-600 hover:text-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Otwórz aplikację PracujMatcher
                </a>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Błąd uwierzytelniania
              </h3>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Spróbuj ponownie
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Powrót do panelu
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Jak to działa?
            </h4>
            <ul className="text-xs text-blue-700 space-y-1 text-left">
              <li>1. Generujemy bezpieczny token uwierzytelniania</li>
              <li>2. Przekierowujemy Cię do aplikacji desktop</li>
              <li>3. Aplikacja używa tokenu do dostępu do Twojego konta</li>
              <li>4. Token wygasa automatycznie po 15 minutach</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopAuthPage;