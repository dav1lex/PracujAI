'use client';

import { useState } from 'react';
import { Download, Mail, Calendar, CreditCard, Hash } from 'lucide-react';
import { type CreditTransaction } from '@/types/credits';

interface PaymentReceiptProps {
  transaction: CreditTransaction;
  onClose: () => void;
}

export function PaymentReceipt({ transaction, onClose }: PaymentReceiptProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    // Assuming the amount stored is in credits, we need to calculate the price
    // This is a simplified calculation - in a real app, you'd store the actual price
    const pricePerCredit = 0.30; // Base price per credit in PLN
    const totalPrice = amount * pricePerCredit;
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(totalPrice);
  };

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      // Generate PDF receipt (simplified - in a real app, you'd use a PDF library)
      // const receiptData = {
      //   transactionId: transaction.id,
      //   paymentIntentId: transaction.stripe_payment_intent_id,
      //   amount: transaction.amount,
      //   date: transaction.created_at,
      //   description: transaction.description
      // };

      // Create a simple text receipt for now
      const receiptText = `
PARAGON FISKALNY
PracujMatcher - Dopasowania ofert pracy

Data: ${formatDate(transaction.created_at)}
ID transakcji: ${transaction.id}
ID płatności Stripe: ${transaction.stripe_payment_intent_id}

Opis: ${transaction.description}
Ilość kredytów: ${transaction.amount}
Wartość: ${formatCurrency(transaction.amount)}

Dziękujemy za zakup!
      `;

      // Create and download file
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paragon-${transaction.id.substring(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Błąd podczas pobierania paragonu');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailReceipt = async () => {
    setIsEmailSending(true);
    try {
      const response = await fetch('/api/payments/send-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction.id
        })
      });

      if (response.ok) {
        alert('Paragon został wysłany na Twój adres e-mail');
      } else {
        throw new Error('Failed to send receipt');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      alert('Błąd podczas wysyłania paragonu');
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Paragon płatności
          </h2>
          <p className="text-gray-600">
            Szczegóły Twojego zakupu
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Data zakupu</span>
            </div>
            <span className="font-medium">{formatDate(transaction.created_at)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center text-gray-600">
              <CreditCard className="w-4 h-4 mr-2" />
              <span>Kredyty</span>
            </div>
            <span className="font-medium">{transaction.amount}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center text-gray-600">
              <Hash className="w-4 h-4 mr-2" />
              <span>ID płatności</span>
            </div>
            <span className="font-medium text-sm">
              {transaction.stripe_payment_intent_id?.substring(0, 20)}...
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Opis:</span>
              <span className="font-medium">{transaction.description}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Wartość:</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Pobieranie...' : 'Pobierz'}
            </button>

            <button
              onClick={handleEmailReceipt}
              disabled={isEmailSending}
              className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isEmailSending ? 'Wysyłanie...' : 'Wyślij e-mail'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition-colors"
          >
            Zamknij
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            ID transakcji: {transaction.id}
          </p>
        </div>
      </div>
    </div>
  );
}