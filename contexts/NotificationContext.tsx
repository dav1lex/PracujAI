'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PolishError, ErrorSeverity } from '@/utils/error-handling';

// Notification types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  timestamp: Date;
}

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (error: string | PolishError, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Default durations based on notification type
const DEFAULT_DURATIONS = {
  [NotificationType.SUCCESS]: 4000,
  [NotificationType.ERROR]: 6000,
  [NotificationType.WARNING]: 5000,
  [NotificationType.INFO]: 4000
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? DEFAULT_DURATIONS[notification.type]
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [generateId, removeNotification]);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: NotificationType.SUCCESS,
      title,
      message,
      duration
    });
  }, [showNotification]);

  const showError = useCallback((error: string | PolishError, title?: string, duration?: number) => {
    const message = typeof error === 'string' ? error : error.polishMessage;
    const errorTitle = title || (typeof error !== 'string' && error.severity === ErrorSeverity.CRITICAL ? 'Błąd krytyczny' : 'Błąd');
    
    showNotification({
      type: NotificationType.ERROR,
      title: errorTitle,
      message,
      duration,
      persistent: typeof error !== 'string' && error.severity === ErrorSeverity.CRITICAL
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: NotificationType.WARNING,
      title: title || 'Ostrzeżenie',
      message,
      duration
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: NotificationType.INFO,
      title,
      message,
      duration
    });
  }, [showNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}