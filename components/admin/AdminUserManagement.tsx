"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminUserDetails } from './AdminUserDetails';
import { 
  Search, 
  Users, 
  Star, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface User {
  id: string;
  email: string;
  registration_date: string;
  current_credits: number;
  total_purchased: number;
  total_consumed: number;
  is_early_adopter: boolean;
  last_activity: string;
  total_transactions: number;
}

interface UserStats {
  total_users: number;
  early_adopters: number;
  remaining_slots: number;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total_users: 0, early_adopters: 0, remaining_slots: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('registration_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const { session } = useAuth();
  const { showError } = useNotifications();

  const fetchUsers = async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      } else {
        showError('Błąd podczas pobierania użytkowników');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, sortBy, sortOrder, session, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
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



  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wszyscy użytkownicy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                Łączna liczba zarejestrowanych
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
              <CardTitle className="text-sm font-medium">Wczesni użytkownicy</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.early_adopters}</div>
              <p className="text-xs text-muted-foreground">
                Z darmowymi kredytami
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
              <CardTitle className="text-sm font-medium">Pozostałe sloty</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.remaining_slots}</div>
              <p className="text-xs text-muted-foreground">
                Darmowych kredytów do rozdania
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie użytkownikami</CardTitle>
          <CardDescription>
            Wyszukuj i zarządzaj kontami użytkowników
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Szukaj po email lub ID użytkownika..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Szukaj
            </Button>
          </form>

          {/* Sort Controls */}
          <div className="flex gap-2 mb-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="registration_date">Data rejestracji</option>
              <option value="current_credits">Aktualne kredyty</option>
              <option value="total_consumed">Zużyte kredyty</option>
              <option value="last_activity">Ostatnia aktywność</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="desc">Malejąco</option>
              <option value="asc">Rosnąco</option>
            </select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
              <p>Ładowanie użytkowników...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{user.email}</h3>
                        {user.is_early_adopter && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Wczesny użytkownik
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Rejestracja:</span><br />
                          {formatDate(user.registration_date)}
                        </div>
                        <div>
                          <span className="font-medium">Kredyty:</span><br />
                          {user.current_credits} dostępne
                        </div>
                        <div>
                          <span className="font-medium">Zużyte:</span><br />
                          {user.total_consumed} kredytów
                        </div>
                        <div>
                          <span className="font-medium">Ostatnia aktywność:</span><br />
                          {formatDate(user.last_activity)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Szczegóły
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Strona {currentPage} z {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Poprzednia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Następna
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUserId && (
        <AdminUserDetails
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}