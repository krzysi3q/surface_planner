import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification, NotificationContextType } from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = notification.duration ?? 2500; // Reduced from 3000ms to 2500ms
    const newNotification: Notification = {
      ...notification,
      id,
      duration,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addNotification({ type: 'success', message, duration });
  }, [addNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addNotification({ type: 'warning', message, duration });
  }, [addNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    addNotification({ type: 'error', message, duration });
  }, [addNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addNotification({ type: 'info', message, duration });
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showWarning,
    showError,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
