"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Check, 
  Star, 
  Zap,
  Shield,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { CREDIT_PACKAGES } from '@/types/credits';
import { POLISH_CONTENT, formatPolishCurrency } from '@/utils/polish-content';

interface CreditPurchaseInterfaceProps {
  onPackageSelect?: (packageId: string) => void;
  isLoading?: boolean;
}

export function CreditPurchaseInterface({ 
  onPackageSelect, 
  isLoading = false 
}: CreditPurchaseInterfaceProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePackageSelect = async (packageId: string) => {
    setSelectedPackage(packageId);
    if (onPackageSelect) {
      setIsProcessing(true);
      try {
        await onPackageSelect(packageId);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getPackageIcon = (credits: number) => {
    if (credits >= 500) return <Zap className="h-6 w-6" />;
    if (credits >= 200) return <Star className="h-6 w-6" />;
    return <CreditCard className="h-6 w-6" />;
  };

  const getPackageBadge = (packageItem: typeof CREDIT_PACKAGES[0]) => {
    if (packageItem.popular) {
      return (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            {POLISH_CONTENT.credits.popular}
          </div>
        </div>
      );
    }
    if (packageItem.credits >= 500) {
      return (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            {POLISH_CONTENT.credits.bestValue}
          </div>
        </div>
      );
    }
    return null;
  };

  const calculateSavings = (packageItem: typeof CREDIT_PACKAGES[0]) => {
    const basePrice = 0.30; // Base price per credit in PLN
    const totalBasePrice = packageItem.credits * basePrice;
    const savings = totalBasePrice - packageItem.price;
    const savingsPercentage = (savings / totalBasePrice) * 100;
    
    return {
      amount: savings,
      percentage: Math.round(savingsPercentage)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {POLISH_CONTENT.credits.buyCredits}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Wybierz pakiet kredytów, który najlepiej odpowiada Twoim potrzebom
        </p>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((packageItem, index) => {
          const savings = calculateSavings(packageItem);
          const isSelected = selectedPackage === packageItem.id;
          const isCurrentlyProcessing = isProcessing && isSelected;
          
          return (
            <motion.div
              key={packageItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-neutral-dark rounded-xl p-6 border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-blue-500 shadow-lg scale-105'
                  : packageItem.popular
                  ? 'border-blue-200 dark:border-blue-800 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              onClick={() => !isLoading && !isProcessing && handlePackageSelect(packageItem.id)}
            >
              {getPackageBadge(packageItem)}
              
              {/* Package Icon */}
              <div className={`inline-flex p-3 rounded-lg mb-4 ${
                packageItem.popular 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getPackageIcon(packageItem.credits)}
              </div>

              {/* Package Details */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {packageItem.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {packageItem.description}
                </p>
                
                {/* Price */}
                <div className="mb-3">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatPolishCurrency(packageItem.price)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {formatPolishCurrency(packageItem.price / packageItem.credits)} za kredyt
                  </div>
                </div>

                {/* Savings Badge */}
                {savings.percentage > 0 && (
                  <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium mb-3">
                    <Check className="h-3 w-3 mr-1" />
                    Oszczędzasz {savings.percentage}%
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  {packageItem.credits} dopasowań ofert pracy
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Natychmiastowa aktywacja
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Bezpieczna płatność Stripe
                </div>
                {packageItem.popular && (
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Najczęściej wybierany
                  </div>
                )}
              </div>

              {/* Select Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : packageItem.popular
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
                disabled={isLoading || isProcessing}
              >
                {isCurrentlyProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {POLISH_CONTENT.loading.processing}
                  </>
                ) : isSelected ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Wybrano
                  </>
                ) : (
                  <>
                    {POLISH_CONTENT.credits.selectPackage}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
      >
        <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
          <Shield className="h-4 w-4 mr-2 text-green-500" />
          <span>
            Bezpieczne płatności obsługiwane przez Stripe. 
            Twoje dane karty są w pełni chronione.
          </span>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-neutral-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Często zadawane pytania
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-1">
              Jak działają kredyty?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Każde dopasowanie oferty pracy kosztuje 1 kredyt. Kredyty nie wygasają i możesz ich używać w dowolnym tempie.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-1">
              Czy mogę anulować zakup?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tak, oferujemy 14-dniową gwarancję zwrotu pieniędzy bez podania przyczyny.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-1">
              Czy dane mojej karty są bezpieczne?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tak, wszystkie płatności są przetwarzane przez Stripe, który spełnia najwyższe standardy bezpieczeństwa PCI DSS.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}