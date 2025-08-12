"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Users, 
  Download,
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface SystemMetrics {
  users: {
    total: number;
    earlyAdopters: number;
    remainingSlots: number;
    registrationsToday: number;
  };
  credits: {
    totalTransactions: number;
    creditsGrantedToday: number;
    creditsPurchasedToday: number;
    creditsConsumedToday: number;
  };
  sessions: {
    activeSessions: number;
    averageSessionDuration: number;
  };
  downloads: {
    downloadsToday: number;
    uniqueDownloaders: number;
  };
  system: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    errors: number;
  };
}

interface RecentActivity {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
  users: { email: string };
}

export function AdminSystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { session } = useAuth();
  const { showError } = useNotifications();

  const fetchSystemHealth = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/admin/system', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setRecentActivity(data.recentActivity);
        setLastUpdate(new Date());
      } else {
        showError('Błąd podczas pobierania metryk systemu');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      showError('Błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, showError]);

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getHealthStatus = () => {
    if (!metrics) return { status: 'unknown', color: 'gray' };
    
    const memoryUsagePercent = (metrics.system.memoryUsage.heapUsed / metrics.system.memoryUsage.heapTotal) * 100;
    const hasErrors = metrics.system.errors > 0;
    
    if (hasErrors || memoryUsagePercent > 90) {
      return { status: 'critical', color: 'red' };
    } else if (memoryUsagePercent > 70) {
      return { status: 'warning', color: 'yellow' };
    } else {
      return { status: 'healthy', color: 'green' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
        <p>Ładowanie metryk systemu...</p>
      </div>
    );
  }

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Status systemu
              </CardTitle>
              <CardDescription>
                Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString('pl-PL')}
              </CardDescription>
            </div>
            <Badge 
              variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {healthStatus.status === 'healthy' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {healthStatus.status === 'healthy' ? 'Zdrowy' : 
               healthStatus.status === 'warning' ? 'Ostrzeżenie' : 'Krytyczny'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{metrics.users.registrationsToday} dzisiaj
                </p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600">{metrics.users.earlyAdopters} wczesnych</span>
                  <span className="text-muted-foreground"> • </span>
                  <span className="text-blue-600">{metrics.users.remainingSlots} slotów</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Credit Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kredyty dzisiaj</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.credits.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  transakcji
                </p>
                <div className="mt-2 text-xs">
                  <span className="text-green-600">+{metrics.credits.creditsGrantedToday} przyznane</span><br />
                  <span className="text-blue-600">+{metrics.credits.creditsPurchasedToday} zakupione</span><br />
                  <span className="text-orange-600">-{metrics.credits.creditsConsumedToday} zużyte</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Session Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sesje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.sessions.activeSessions}</div>
                <p className="text-xs text-muted-foreground">
                  aktywnych sesji
                </p>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">
                    Średni czas: {metrics.sessions.averageSessionDuration}min
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Download Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pobierania</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.downloads.downloadsToday}</div>
                <p className="text-xs text-muted-foreground">
                  dzisiaj
                </p>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">
                    {metrics.downloads.uniqueDownloaders} unikalnych użytkowników
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Wydajność systemu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Czas działania</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatUptime(metrics.system.uptime)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pamięć</span>
                  <span className="text-sm">{formatBytes(metrics.system.memoryUsage.heapUsed)} / {formatBytes(metrics.system.memoryUsage.heapTotal)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(metrics.system.memoryUsage.heapUsed / metrics.system.memoryUsage.heapTotal) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Node.js</span>
                <span className="text-sm">{metrics.system.nodeVersion}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Błędy</span>
                <Badge variant={metrics.system.errors > 0 ? 'destructive' : 'default'}>
                  {metrics.system.errors}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Ostatnia aktywność</CardTitle>
            <CardDescription>
              Najnowsze operacje w systemie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 8).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.users?.email || `Użytkownik ${activity.id.slice(0, 8)}...`}
                    </p>
                    <p className="text-muted-foreground text-xs">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.transaction_type === 'grant' ? 'default' :
                      activity.transaction_type === 'purchase' ? 'secondary' : 'destructive'
                    } size="sm">
                      {activity.transaction_type === 'consumption' ? '-' : '+'}{activity.amount}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}