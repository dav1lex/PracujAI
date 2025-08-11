'use client';

import { useState, useEffect } from 'react';
import { Calendar, CreditCard, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { type CreditTransaction } from '@/types/credits';
import { PaymentReceipt } from './PaymentReceipt';
import LoadingSpinner from './LoadingSpinner';
import { POLISH_CONTENT, formatPolishDate, formatPolishCurrency } from '@/utils/polish-content';

interface PaymentHistoryResponse {
    transactions: CreditTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function PaymentHistory() {
    const { user, session } = useAuth();
    const { handleApiError } = useErrorHandler();
    const { showSuccess } = useNotifications();
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<CreditTransaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchPaymentHistory = async (page: number = 1) => {
        if (!session?.access_token) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/payments/history?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(POLISH_CONTENT.errors.serverError);
            }

            const data: PaymentHistoryResponse = await response.json();
            setTransactions(data.transactions);
            setPagination(data.pagination);
            setCurrentPage(page);

        } catch (error) {
            handleApiError(error, '/api/payments/history', 'GET');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentHistory(1);
    }, [user]);

    const formatCurrency = (amount: number) => {
        // Simplified calculation - in a real app, you'd store the actual price
        const pricePerCredit = 0.30;
        const totalPrice = amount * pricePerCredit;
        return formatPolishCurrency(totalPrice);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchPaymentHistory(page);
        }
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
            </div>
        );
    }



    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Brak historii płatności
                </h3>
                <p className="text-gray-600">
                    Nie masz jeszcze żadnych zakupów kredytów.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Historia płatności</h2>
                <div className="text-sm text-gray-600">
                    {pagination.total} {pagination.total === 1 ? 'transakcja' : 'transakcji'}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600">
                                            {formatPolishDate(transaction.created_at)}
                                        </span>
                                    </div>

                                    <h3 className="font-medium text-gray-900 mb-1">
                                        {transaction.description}
                                    </h3>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        <span>{transaction.amount} kredytów</span>
                                        <span className="mx-2">•</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">
                                            ID: {transaction.stripe_payment_intent_id?.substring(0, 12)}...
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedTransaction(transaction)}
                                        className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        <Receipt className="w-4 h-4 mr-1" />
                                        Paragon
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Strona {pagination.page} z {pagination.totalPages}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Poprzednia
                        </button>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= pagination.totalPages}
                            className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Następna
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedTransaction && (
                <PaymentReceipt
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
}