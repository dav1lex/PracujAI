"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { 
  User,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  users: { email: string };
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [response, setResponse] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  
  const { session } = useAuth();
  const { showError, showSuccess } = useNotifications();

  const fetchTickets = async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: currentPage.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/admin/support?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      } else {
        showError('Błąd podczas pobierania zgłoszeń');
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      showError('Błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, currentPage, session, fetchTickets]);

  const handleTicketUpdate = async (ticketId: string, updates: { status?: string; response?: string; internal_notes?: string }) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketId,
          ...updates
        })
      });

      if (response.ok) {
        showSuccess('Zgłoszenie zostało zaktualizowane');
        fetchTickets(); // Refresh tickets
        setSelectedTicket(null);
        setResponse('');
        setInternalNotes('');
      } else {
        showError('Błąd podczas aktualizacji zgłoszenia');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Otwarte';
      case 'in_progress': return 'W trakcie';
      case 'resolved': return 'Rozwiązane';
      case 'closed': return 'Zamknięte';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
        <p>Ładowanie zgłoszeń...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Otwarte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">W trakcie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Rozwiązane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Zamknięte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Zgłoszenia wsparcia</CardTitle>
          <CardDescription>
            Zarządzaj zgłoszeniami użytkowników
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {[
              { value: 'all', label: 'Wszystkie' },
              { value: 'open', label: 'Otwarte' },
              { value: 'in_progress', label: 'W trakcie' },
              { value: 'resolved', label: 'Rozwiązane' },
              { value: 'closed', label: 'Zamknięte' }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(filter.value);
                  setCurrentPage(1);
                }}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.users.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ticket.created_at)}
                      </span>
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    Od: {selectedTicket.users.email} • {formatDate(selectedTicket.created_at)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                  Zamknij
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Opis problemu</h3>
                  <p className="text-sm bg-slate-50 dark:bg-slate-700 p-3 rounded">
                    {selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.admin_response && (
                  <div>
                    <h3 className="font-medium mb-2">Odpowiedź administratora</h3>
                    <p className="text-sm bg-blue-50 dark:bg-blue-900 p-3 rounded">
                      {selectedTicket.admin_response}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Odpowiedź dla użytkownika</h3>
                  <textarea
                    className="w-full p-3 border rounded-md"
                    rows={4}
                    placeholder="Napisz odpowiedź dla użytkownika..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Notatki wewnętrzne</h3>
                  <textarea
                    className="w-full p-3 border rounded-md"
                    rows={3}
                    placeholder="Notatki tylko dla administratorów..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleTicketUpdate(selectedTicket.id, {
                      status: 'in_progress',
                      response,
                      internal_notes: internalNotes
                    })}
                  >
                    Oznacz jako w trakcie
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTicketUpdate(selectedTicket.id, {
                      status: 'resolved',
                      response,
                      internal_notes: internalNotes
                    })}
                  >
                    Oznacz jako rozwiązane
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTicketUpdate(selectedTicket.id, {
                      status: 'closed',
                      response,
                      internal_notes: internalNotes
                    })}
                  >
                    Zamknij zgłoszenie
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}