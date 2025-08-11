"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUserManagement } from './AdminUserManagement';

import { AdminCreditAnalytics } from './AdminCreditAnalytics';
import { AdminSystemHealth } from './AdminSystemHealth';
import { AdminSupportTickets } from './AdminSupportTickets';
import {
    Users,
    CreditCard,
    Activity,
    Shield,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminDashboardProps {
    className?: string;
}

export function AdminDashboard({ className = '' }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState('users');
    const { session } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check admin authorization
    useEffect(() => {
        const checkAdminAccess = async () => {
            if (!session?.access_token) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/admin/system', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                setIsAuthorized(response.ok);
            } catch (error) {
                console.error('Admin access check failed:', error);
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminAccess();
    }, [session]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4 mx-auto"></div>
                    <p className="text-foreground">Sprawdzanie uprawnień administratora...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Brak dostępu
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Nie masz uprawnień do panelu administratora.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Panel Administratora
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Zarządzanie użytkownikami, kredytami i monitorowanie systemu
                </p>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="users" className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Użytkownicy
                    </TabsTrigger>
                    <TabsTrigger value="credits" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Kredyty
                    </TabsTrigger>
                    <TabsTrigger value="support" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Wsparcie
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        System
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    <AdminUserManagement />
                </TabsContent>

                <TabsContent value="credits" className="space-y-6">
                    <AdminCreditAnalytics />
                </TabsContent>

                <TabsContent value="support" className="space-y-6">
                    <AdminSupportTickets />
                </TabsContent>

                <TabsContent value="system" className="space-y-6">
                    <AdminSystemHealth />
                </TabsContent>
            </Tabs>
        </div>
    );
}