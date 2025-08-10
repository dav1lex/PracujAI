"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Download, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Minus,
  Gift,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTransactionHistory } from '@/utils/credits';
import { POLISH_CONTENT, formatPolishDate, getPolishRelativeTime } from '@/utils/polish-content';
import { CreditTransaction } from '@/types/credits';

interface TransactionHistoryProps {
  className?: string;
}

type SortField = 'created_at' | 'amount' | 'transaction_type';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'purchase' | 'consumption' | 'grant';

export function CreditTransactionHistory({ className = '' }: TransactionHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getUserTransactionHistory(user.id, currentPage, itemsPerPage);
      
      let filteredTransactions = result.transactions;
      
      // Apply filter
      if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.transaction_type === filterType);
      }
      
      // Apply search
      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      filteredTransactions.sort((a, b) => {
        let aValue: string | number = a[sortField];
        let bValue: string | number = b[sortField];
        
        if (sortField === 'created_at') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setTransactions(filteredTransactions);
      setTotalCount(result.total_count);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Błąd podczas ładowania historii transakcji');
      // Set empty state to prevent infinite loading
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentPage, filterType, sortField, sortDirection, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);



  const exportTransactions = () => {
    const csvContent = [
      ['Data', 'Typ', 'Ilość', 'Opis'].join(','),
      ...transactions.map(t => [
        formatPolishDate(t.created_at),
        getTransactionTypeLabel(t.transaction_type),
        t.amount.toString(),
        t.description || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transakcje_kredytowe_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'consumption':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'grant':
        return <Gift className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Zakup';
      case 'consumption':
        return 'Wykorzystanie';
      case 'grant':
        return 'Przyznanie';
      default:
        return 'Nieznany';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'grant':
        return 'text-green-600 dark:text-green-400';
      case 'consumption':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'grant':
        return '+';
      case 'consumption':
        return '-';
      default:
        return '';
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading && transactions.length === 0) {
    return (
      <div className={`bg-white dark:bg-neutral-dark rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {POLISH_CONTENT.credits.transactionHistory}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtry
              {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </button>
            
            <button
              onClick={exportTransactions}
              disabled={transactions.length === 0}
              className="flex items-center px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Eksportuj
            </button>
            
            <button
              onClick={fetchTransactions}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj w opisach..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Wszystkie typy</option>
                <option value="purchase">Zakupy</option>
                <option value="consumption">Wykorzystanie</option>
                <option value="grant">Przyznania</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortField}_${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('_');
                  setSortField(field as SortField);
                  setSortDirection(direction as SortDirection);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at_desc">Najnowsze</option>
                <option value="created_at_asc">Najstarsze</option>
                <option value="amount_desc">Największa kwota</option>
                <option value="amount_asc">Najmniejsza kwota</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transaction List */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{POLISH_CONTENT.credits.noTransactions}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-lg">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {getPolishRelativeTime(transaction.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold ${getAmountColor(transaction.transaction_type)}`}>
                    {getAmountPrefix(transaction.transaction_type)}{transaction.amount}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {getTransactionTypeLabel(transaction.transaction_type)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Strona {currentPage} z {totalPages} ({totalCount} transakcji)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Poprzednia
              </button>
              
              <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Następna
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}