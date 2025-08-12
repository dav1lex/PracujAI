"use client";

import { useState, useEffect, useCallback } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  CreditCard, 
  Activity, 
  Download,
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface UserDetails {
  user: {
    id: string;
    email: string;
    created_at: string;
    is_suspended?: boolean;
    suspension_reason?: string;
  };
  credits: {
    balance: number;
    total_purchased: number;
    total_consumed: number;
    is_early_adopter: boolean;
  };
  transactions: Array<{
    id: string;
    transaction_type: string;
    amount: number;
    description: string;
    created_at: string;
  }>;
  sessions: Array<{
    id: string;
    created_at: string;
    expires_at: string;
    last_activity: string;
  }>;
  downloads: Array<{
    id: string;
    version: string;
    downloaded_at: string;
  }>;
  supportTickets: Array<{
    id: string;
    subject: string;
    status: string;
    created_at: string;
  }>;
  activityMetrics: {
    totalTransactions: number;
    totalCreditsUsed: number;
    activeSessions: number;
    totalDownloads: number;
    openTickets: number;
    lastActivity: string;
  };
}

interface AdminUserDetailsProps {
  userId: string;
  onClose: () => void;
}

export function AdminUserDetails({ userId, onClose }: AdminUserDetailsProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [creditAdjustment, setCreditAdjustment] = useState({ amount: '', description: '' });

  
  const { session } = useAuth();
  const { showError, showSuccess } = useNotifications();

  const fetchUserDetails = useCallback(async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        showError('Błąd podczas pobierania szczegółów użytkownika');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showError('Błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  }, [userId, session?.access_token, showError]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleUserAction = async (action: string, data?: Record<string, unknown>) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ...data
        })
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(result.message || 'Akcja wykonana pomyślnie');
        fetchUserDetails(); // Refresh data
        
        // Clear forms
        setCreditAdjustment({ amount: '', description: '' });
      } else {
        showError('Błąd podczas wykonywania akcji');
      }
    } catch (error) {
      console.error('Error performing user action:', error);
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
      case 'grant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'purchase': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'consumption': return <Activity className="h-4 w-4 text-orange-500" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>Ładowanie szczegółów użytkownika...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8">
          <p>Nie udało się załadować szczegółów użytkownika</p>
          <Button onClick={onClose} className="mt-4">Zamknij</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6" />
                {userDetails.user.email}
              </h2>
              <p className="text-sm text-muted-foreground">
                Zarejestrowany: {formatDate(userDetails.user.created_at)}
              </p>
              {userDetails.user.is_suspended && (
                <Badge variant="destructive" className="mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Konto zawieszone
                </Badge>
              )}
              {userDetails.credits.is_early_adopter && (
                <Badge variant="secondary" className="mt-2 ml-2">
                  Wczesny użytkownik
                </Badge>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Kredyty</p>
                    <p className="text-2xl font-bold">{userDetails.credits.balance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Zużyte</p>
                    <p className="text-2xl font-bold">{userDetails.credits.total_consumed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Pobierania</p>
                    <p className="text-2xl font-bold">{userDetails.activityMetrics.totalDownloads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Zgłoszenia</p>
                    <p className="text-2xl font-bold">{userDetails.activityMetrics.openTickets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-4">
              {[
                { id: 'overview', label: 'Przegląd' },
                { id: 'transactions', label: 'Transakcje' },
                { id: 'sessions', label: 'Sesje' },
                { id: 'support', label: 'Wsparcie' },
                { id: 'actions', label: 'Akcje' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`pb-2 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informacje o koncie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>{userDetails.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data rejestracji:</span>
                      <span>{formatDate(userDetails.user.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ostatnia aktywność:</span>
                      <span>{userDetails.activityMetrics.lastActivity ? formatDate(userDetails.activityMetrics.lastActivity) : 'Brak'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aktywne sesje:</span>
                      <span>{userDetails.activityMetrics.activeSessions}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statystyki kredytów</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Aktualne saldo:</span>
                      <span className="font-bold">{userDetails.credits.balance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Łącznie zakupione:</span>
                      <span>{userDetails.credits.total_purchased}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Łącznie zużyte:</span>
                      <span>{userDetails.credits.total_consumed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wczesny użytkownik:</span>
                      <span>{userDetails.credits.is_early_adopter ? 'Tak' : 'Nie'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'transactions' && (
              <Card>
                <CardHeader>
                  <CardTitle>Historia transakcji</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userDetails.transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.transaction_type === 'consumption' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.transaction_type === 'consumption' ? '-' : '+'}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'sessions' && (
              <Card>
                <CardHeader>
                  <CardTitle>Sesje aplikacji</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userDetails.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Sesja aplikacji</p>
                          <p className="text-sm text-muted-foreground">
                            Utworzona: {formatDate(session.created_at)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ostatnia aktywność: {formatDate(session.last_activity)}
                          </p>
                        </div>
                        <Badge variant={new Date(session.expires_at) > new Date() ? 'default' : 'secondary'}>
                          {new Date(session.expires_at) > new Date() ? 'Aktywna' : 'Wygasła'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'support' && (
              <Card>
                <CardHeader>
                  <CardTitle>Zgłoszenia wsparcia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userDetails.supportTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <Badge variant={ticket.status === 'open' ? 'destructive' : 'default'}>
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'actions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Zarządzanie kredytami</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Liczba kredytów</label>
                        <Input
                          type="number"
                          placeholder="Wprowadź liczbę kredytów"
                          value={creditAdjustment.amount}
                          onChange={(e) => setCreditAdjustment(prev => ({ ...prev, amount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Opis</label>
                        <Input
                          placeholder="Powód korekty kredytów"
                          value={creditAdjustment.description}
                          onChange={(e) => setCreditAdjustment(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <Button
                        onClick={() => handleUserAction('adjust_credits', creditAdjustment)}
                        disabled={!creditAdjustment.amount}
                        className="w-full"
                      >
                        Dodaj kredyty
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Akcje na koncie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleUserAction('reset_password')}
                      className="w-full"
                    >
                      Resetuj hasło
                    </Button>
                    
                    {userDetails.user.is_suspended ? (
                      <Button
                        variant="outline"
                        onClick={() => handleUserAction('reactivate_account')}
                        className="w-full"
                      >
                        Reaktywuj konto
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => handleUserAction('suspend_account', { reason: 'Zawieszone przez administratora' })}
                        className="w-full"
                      >
                        Zawieś konto
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}