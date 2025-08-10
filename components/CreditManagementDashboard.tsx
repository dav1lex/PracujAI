"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditBalanceDashboard } from './CreditBalanceDashboard';
import { CreditPurchaseInterface } from './CreditPurchaseInterface';
import { CreditTransactionHistory } from './CreditTransactionHistory';
import { 
  History, 
  ShoppingCart,
  TrendingUp
} from 'lucide-react';

interface CreditManagementDashboardProps {
  className?: string;
}

export function CreditManagementDashboard({ className = '' }: CreditManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handlePackageSelect = async (packageId: string) => {
    // This would integrate with Stripe payment processing
    console.log('Selected package:', packageId);
    // TODO: Implement Stripe payment flow
    // For now, just switch to history tab after "purchase"
    setTimeout(() => {
      setActiveTab('history');
    }, 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Zarządzanie kredytami
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitoruj swoje saldo, kupuj kredyty i przeglądaj historię transakcji
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Kup kredyty
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="h-4 w-4 mr-2" />
            Historia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CreditBalanceDashboard />
        </TabsContent>

        <TabsContent value="purchase" className="space-y-6">
          <CreditPurchaseInterface onPackageSelect={handlePackageSelect} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <CreditTransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}