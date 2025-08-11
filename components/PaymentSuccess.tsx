'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon } from 'lucide-react';
import { type CreditPackage } from '@/types/credits';

interface PaymentSuccessProps {
  paymentIntentId: string;
  packageInfo: CreditPackage;
  onClose: () => void;
}

export function PaymentSuccess({ paymentIntentId, packageInfo, onClose }: PaymentSuccessProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Płatność zakończona sukcesem!
          </h2>
          <p className="text-gray-600">
            Twoje kredyty zostały dodane do konta
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Szczegóły zakupu:</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Pakiet:</strong> {packageInfo.name}</p>
            <p><strong>Kredyty:</strong> {packageInfo.credits}</p>
            <p><strong>Kwota:</strong> {packageInfo.price.toFixed(2)} zł</p>
            <p><strong>ID płatności:</strong> {paymentIntentId.substring(0, 20)}...</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Przejdź do panelu
          </button>
          
          <p className="text-sm text-gray-500">
            Automatyczne przekierowanie za {countdown} sekund
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Potwierdzenie zostało wysłane na Twój adres e-mail
          </p>
        </div>
      </div>
    </div>
  );
}