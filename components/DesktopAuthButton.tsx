'use client';

import React, { useState } from 'react';
import { Monitor, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface DesktopAuthButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

const DesktopAuthButton: React.FC<DesktopAuthButtonProps> = ({ 
  className = '', 
  variant = 'primary' 
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDesktopAuth = () => {
    // Open the desktop authentication flow
    const authUrl = '/auth/desktop?redirect_url=pracujmatcher://auth';
    window.open(authUrl, '_blank');
  };

  const copyAuthUrl = async () => {
    const authUrl = `${window.location.origin}/auth/desktop?redirect_url=pracujmatcher://auth`;
    try {
      await navigator.clipboard.writeText(authUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const baseClasses = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <div className={className}>
      <div className="space-y-4">
        <button
          onClick={handleDesktopAuth}
          className={`${baseClasses} px-4 py-2 rounded-md transition-colors flex items-center space-x-2`}
        >
          <Monitor className="w-4 h-4" />
          <span>Zaloguj aplikację desktop</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          {showInstructions ? 'Ukryj instrukcje' : 'Pokaż instrukcje'}
        </button>
      </div>

      {showInstructions && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Jak zalogować aplikację desktop:
          </h4>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Uruchom aplikację PracujMatcher</p>
                <p>Otwórz aplikację desktop na swoim komputerze</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Kliknij &quot;Zaloguj się&quot;</p>
                <p>W aplikacji kliknij przycisk logowania - otworzy się przeglądarka</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Potwierdź uwierzytelnianie</p>
                <p>Zostaniesz automatycznie przekierowany z powrotem do aplikacji</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              Alternatywnie, możesz skopiować link uwierzytelniania:
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyAuthUrl}
                className="flex items-center space-x-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Skopiowano!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Skopiuj link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopAuthButton;