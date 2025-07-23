import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useNotification } from './NotificationContext';
import { NotificationType, Notification } from './types';
import { classMerge } from '@/utils/classMerge';
import './animations.css';

interface AnimatedNotification extends Notification {
  isExiting?: boolean;
  isEntering?: boolean;
}

const getNotificationStyles = (type: NotificationType) => {
  const baseStyles = 'flex items-center gap-3 p-3 rounded-md shadow-md border backdrop-blur-sm transition-all duration-200 ease-out';
  
  switch (type) {
    case 'success':
      return classMerge(baseStyles, 'bg-green-50/90 border-green-200/70 text-green-700');
    case 'warning':
      return classMerge(baseStyles, 'bg-yellow-50/90 border-yellow-200/70 text-yellow-700');
    case 'error':
      return classMerge(baseStyles, 'bg-red-50/90 border-red-200/70 text-red-700');
    case 'info':
      return classMerge(baseStyles, 'bg-blue-50/90 border-blue-200/70 text-blue-700');
    default:
      return classMerge(baseStyles, 'bg-gray-50/90 border-gray-200/70 text-gray-700');
  }
};

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = 'w-4 h-4 flex-shrink-0 transition-transform duration-200 notification-icon';
  
  switch (type) {
    case 'success':
      return <CheckCircle className={classMerge(iconClass, 'text-green-500')} />;
    case 'warning':
      return <AlertTriangle className={classMerge(iconClass, 'text-yellow-500')} />;
    case 'error':
      return <XCircle className={classMerge(iconClass, 'text-red-500')} />;
    case 'info':
      return <Info className={classMerge(iconClass, 'text-blue-500')} />;
    default:
      return <Info className={classMerge(iconClass, 'text-gray-500')} />;
  }
};

const NotificationItem: React.FC<{
  notification: AnimatedNotification;
  onRemove: (id: string) => void;
  index: number;
}> = ({ notification, onRemove, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation with a slight delay based on index for staggered effect
    const enterTimeout = setTimeout(() => {
      setIsVisible(true);
    }, index * 50); // Reduced from 100ms to 50ms

    return () => clearTimeout(enterTimeout);
  }, [index]);

  const handleRemove = () => {
    setIsExiting(true);
    // Wait for exit animation to complete before removing
    setTimeout(() => {
      onRemove(notification.id);
    }, 250); // Reduced from 300ms to 250ms
  };

  const getAnimationClass = () => {
    if (isExiting) return 'notification-exit';
    if (isVisible) {
      switch (notification.type) {
        case 'success':
          return 'notification-bounce notification-success';
        case 'error':
          return 'notification-bounce';
        default:
          return 'notification-enter';
      }
    }
    return '';
  };

  return (
    <div
      className={classMerge(
        getNotificationStyles(notification.type),
        'notification-item',
        getAnimationClass(),
        'hover:shadow-lg group cursor-pointer'
      )}
      style={{
        animationDelay: `${index * 25}ms`, // Reduced from 50ms to 25ms
      }}
    >
      <div className="notification-icon">
        {getNotificationIcon(notification.type)}
      </div>
      <span className="flex-1 text-xs font-medium">{notification.message}</span>
      <button
        onClick={handleRemove}
        className="p-1 hover:bg-black/5 rounded-full transition-all duration-150 notification-close active:scale-95 opacity-60 hover:opacity-100"
        aria-label="Close notification"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const [animatedNotifications, setAnimatedNotifications] = useState<AnimatedNotification[]>([]);

  useEffect(() => {
    // Update animated notifications when notifications change
    setAnimatedNotifications(notifications.map(n => ({ ...n })));
  }, [notifications]);

  if (animatedNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-xs notification-container">
      <div className="space-y-1">
        {animatedNotifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
