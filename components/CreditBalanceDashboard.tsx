"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCreditBalance, getCreditUsageStats } from '@/utils/credits';
import { POLISH_CONTENT, formatPolishCredits } from '@/utils/polish-content';
import { CreditBalanceResponse } from '@/types/credits';

interface UsageStats {
  daily_average: number;
  weekly_total: number;
  monthly_total: number;
  most_active_day: string;
}

export function CreditBalanceDashboard() {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<CreditBalanceResponse | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [balance, stats] = await Promise.all([
        getUserCreditBalance(user.id),
        getCreditUsageStats(user.id)
      ]);
      
      setCreditBalance(balance);
      setUsageStats(stats);
    } catch (err) {
      console.error('Error fetching credit data:', err);
      setError('Błąd podczas ładowania danych kredytowych');
      // Set default values to prevent infinite loading
      setCreditBalance({
        balance: 0,
        total_purchased: 0,
        total_consumed: 0,
        is_early_adopter: false,
        low_credit_warning: false
      });
      setUsageStats({
        daily_average: 0,
        weekly_total: 0,
        monthly_total: 0,
        most_active_day: 'Brak danych'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCreditData();
  }, [fetchCreditData]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-800">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!creditBalance) {
    return null;
  }

  const balanceColor = creditBalance.balance <= 10 
    ? 'text-red-600 dark:text-red-400' 
    : creditBalance.balance <= 50 
    ? 'text-yellow-600 dark:text-yellow-400' 
    : 'text-green-600 dark:text-green-400';

  return (
    <div className="space-y-6">
      {/* Main Credit Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {POLISH_CONTENT.credits.currentBalance}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {POLISH_CONTENT.credits.creditsRemaining}
              </p>
            </div>
          </div>
          
          {creditBalance.is_early_adopter && (
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
              <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-1" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                {POLISH_CONTENT.credits.earlyAdopterBadge}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className={`text-4xl font-bold ${balanceColor} mb-2`}>
            {creditBalance.balance}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {formatPolishCredits(creditBalance.balance)}
          </div>
        </div>

        {/* Low Credit Warning */}
        {creditBalance.low_credit_warning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  {POLISH_CONTENT.credits.lowCreditWarning}
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {POLISH_CONTENT.credits.lowCreditMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Credit Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {POLISH_CONTENT.credits.totalPurchased}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatPolishCredits(creditBalance.total_purchased)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {POLISH_CONTENT.credits.totalConsumed}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatPolishCredits(creditBalance.total_consumed)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Usage Statistics */}
      {usageStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {POLISH_CONTENT.credits.usageStats}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Activity className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {POLISH_CONTENT.credits.dailyAverage}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {usageStats.daily_average.toFixed(1)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {POLISH_CONTENT.credits.weeklyTotal}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {usageStats.weekly_total}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {POLISH_CONTENT.credits.monthlyTotal}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {usageStats.monthly_total}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {POLISH_CONTENT.credits.mostActiveDay}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {usageStats.most_active_day}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {POLISH_CONTENT.dashboard.quickActions}
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <CreditCard className="h-4 w-4 mr-2" />
            {POLISH_CONTENT.credits.buyCredits}
          </button>
          
          <button className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
            <BarChart3 className="h-4 w-4 mr-2" />
            {POLISH_CONTENT.dashboard.viewTransactions}
          </button>
        </div>
      </motion.div>
    </div>
  );
}