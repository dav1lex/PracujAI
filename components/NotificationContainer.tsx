'use client';

import React from 'react';
import { useNotifications, NotificationType, type Notification } from '@/contexts/NotificationContext';
import { POLISH_CONTENT } from '@/utils/polish-content';

// Notification item component
interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const { id, type, title, message, persistent } = notification;

  const getNotificationStyles = () => {
    const baseStyles = "relative flex items-start p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out transform";
    
    switch (type) {
      case NotificationType.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-200`;
      case NotificationType.ERROR:
        return `${baseStyles} bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-200`;
      case NotificationType.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-200`;
      case NotificationType.INFO:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-200`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800 dark:bg-gray-900/20 dark:border-gray-500 dark:text-gray-200`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return (
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case NotificationType.ERROR:
        return (
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case NotificationType.WARNING:
        return (
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case NotificationType.INFO:
        return (
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {!persistent && (
          <button
            onClick={() => onRemove(id)}
            className="ml-4 flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label={POLISH_CONTENT.actions.close}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Main notification container component
export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}