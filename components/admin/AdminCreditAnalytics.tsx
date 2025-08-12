"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  CreditCard, 
  Gift,
  ShoppingCart,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface CreditAnalytics {
  totalTransactions: number;
  totalCreditsGranted: number;
  totalCreditsPurchased: number;
  totalCreditsConsumed: number;
  transactionsByType: {
    grant: number;
    purchase: number;
    consumption: number;
  };
  dailyStats: Array<{
    date: string;
    grants: number;
    purchases: number;
    consumption: number;
    transactions: number;
  }>;
}

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: 'grant' | 'purchase' | 'consumption';
  amount: number;
  description: string;
  created_at: string;
  users?: { email: string };
}

interface TopUser {
  id: string;
  email: string;
  current_credits: number;
  total_consumed: number;
  total_purchased: number;
}

export function AdminCreditAnalytics() {
  const [analytics, setAnalytics] = useState<CreditAnalytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedUserId] = useState('');
  const [creditAdjustment, setCreditAdjustment] = useState({ userId: '', amount: '', description: '' });
  
  const { session } = useAuth();
  const { showError, showSuccess } = useNotifications();

  const fetchAnalytics = useCallback(async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        timeframe,
        ...(selectedUserId && { userId: selectedUserId })
      });

      const response = await fetch(`/api/admin/credits?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setTransactions(data.transactions);
        setTopUsers(data.topUsers);
      } else {
        showError('Błąd podczas pobierania analityki kredytów');
      }
    } catch (error) {
      console.error('Error fetching credit analytics:', error);
      showError('Błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, timeframe, selectedUserId, showError]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !creditAdjustment.userId || !creditAdjustment.amount) return;

    try {
      const response = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: creditAdjustment.userId,
          amount: parseInt(creditAdjustment.amount),
          description: creditAdjustment.description,
          type: 'grant'
        })
      });

      if (response.ok) {
        showSuccess('Kredyty zostały pomyślnie dodane');
        setCreditAdjustment({ userId: '', amount: '', description: '' });
        fetchAnalytics(); // Refresh data
      } else {
        showError('Błąd podczas dodawania kredytów');
      }
    } catch (error) {
      console.error('Error adjusting credits:', error);
      showError('Błąd połączenia z serwerem');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'grant': return <Gift className="h-4 w-4 text-green-500" />;
      case 'purchase': return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'consumption': return <Activity className="h-4 w-4 text-orange-500" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'grant': return 'Przyznane';
      case 'purchase': return 'Zakupione';
      case 'consumption': return 'Zużyte';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
        <p>Ładowanie analityki kredytów...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {[
          { value: '24h', label: '24h' },
          { value: '7d', label: '7 dni' },
          { value: '30d', label: '30 dni' },
          { value: '90d', label: '90 dni' }
        ].map((option) => (
          <Button
            key={option.value}
            variant={timeframe === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Łączne transakcje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  W wybranym okresie
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Przyznane kredyty</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.totalCreditsGranted}</div>
                <p className="text-xs text-muted-foreground">
                  Darmowe kredyty
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zakupione kredyty</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.totalCreditsPurchased}</div>
                <p className="text-xs text-muted-foreground">
                  Płatne kredyty
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zużyte kredyty</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{analytics.totalCreditsConsumed}</div>
                <p className="text-xs text-muted-foreground">
                  Wykorzystane przez użytkowników
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Adjustment Tool */}
        <Card>
          <CardHeader>
            <CardTitle>Zarządzanie kredytami użytkownika</CardTitle>
            <CardDescription>
              Dodaj lub odejmij kredyty dla konkretnego użytkownika
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreditAdjustment} className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID użytkownika</label>
                <Input
                  placeholder="Wprowadź ID użytkownika"
                  value={creditAdjustment.userId}
                  onChange={(e) => setCreditAdjustment(prev => ({ ...prev, userId: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Liczba kredytów</label>
                <Input
                  type="number"
                  placeholder="Wprowadź liczbę kredytów"
                  value={creditAdjustment.amount}
                  onChange={(e) => setCreditAdjustment(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Opis (opcjonalny)</label>
                <Input
                  placeholder="Powód dodania kredytów"
                  value={creditAdjustment.description}
                  onChange={(e) => setCreditAdjustment(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full">
                Dodaj kredyty
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Najaktywniejszi użytkownicy</CardTitle>
            <CardDescription>
              Użytkownicy z największym zużyciem kredytów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.current_credits} kredytów pozostało
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{user.total_consumed}</p>
                    <p className="text-xs text-muted-foreground">zużyte</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie transakcje</CardTitle>
          <CardDescription>
            Najnowsze operacje na kredytach w systemie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="font-medium">
                      {transaction.users?.email || `Użytkownik ${transaction.user_id.slice(0, 8)}...`}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      transaction.transaction_type === 'grant' ? 'default' :
                      transaction.transaction_type === 'purchase' ? 'secondary' : 'destructive'
                    }>
                      {getTransactionLabel(transaction.transaction_type)}
                    </Badge>
                    <span className={`font-bold ${
                      transaction.transaction_type === 'consumption' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.transaction_type === 'consumption' ? '-' : '+'}{transaction.amount}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}