'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_PACKAGES, type CreditPackage } from '@/types/credits';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  selectedPackage: CreditPackage;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function PaymentForm({ selectedPackage, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      onError('Błąd inicjalizacji płatności');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          packageId: selectedPackage.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas tworzenia płatności');
      }

      const { client_secret, payment_intent_id } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Błąd elementu karty');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user.email,
          },
        }
      });

      if (error) {
        throw new Error(error.message || 'Płatność nie powiodła się');
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(payment_intent_id);
      } else {
        throw new Error('Płatność nie została potwierdzona');
      }

    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Nieznany błąd płatności');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">{selectedPackage.name}</h3>
        <p className="text-gray-600 mb-2">{selectedPackage.description}</p>
        <p className="text-2xl font-bold text-blue-600">{selectedPackage.price.toFixed(2)} zł</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Dane karty
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? 'Przetwarzanie...' : `Zapłać ${selectedPackage.price.toFixed(2)} zł`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Płatność jest bezpieczna i szyfrowana przez Stripe
      </p>
    </form>
  );
}

interface CreditPurchaseFormProps {
  onSuccess?: (paymentIntentId: string, packageInfo: CreditPackage) => void;
  onError?: (error: string) => void;
}

export function CreditPurchaseForm({ onSuccess, onError }: CreditPurchaseFormProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePackageSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (selectedPackage && onSuccess) {
      onSuccess(paymentIntentId, selectedPackage);
    }
    setShowPaymentForm(false);
    setSelectedPackage(null);
  };

  const handlePaymentError = (error: string) => {
    if (onError) {
      onError(error);
    }
    setShowPaymentForm(false);
  };

  const handleBack = () => {
    setShowPaymentForm(false);
    setSelectedPackage(null);
  };

  if (showPaymentForm && selectedPackage) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Powrót do wyboru pakietu
          </button>
        </div>
        <Elements stripe={stripePromise}>
          <PaymentForm
            selectedPackage={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Wybierz pakiet kredytów</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`border rounded-lg p-6 relative ${
              pkg.popular
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Najpopularniejszy
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {pkg.price.toFixed(2)} zł
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {(pkg.price / pkg.credits).toFixed(2)} zł za dopasowanie
                </p>
              </div>
              
              <button
                onClick={() => handlePackageSelect(pkg)}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  pkg.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Wybierz pakiet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}