import React, { useState, useEffect } from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

interface AdminNotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return {
        icon: <Info className="w-5 h-5" />,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200',
        iconColor: 'text-blue-500 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-800/30'
      };
    case 'success':
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-200',
        iconColor: 'text-green-500 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-800/30'
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        textColor: 'text-amber-800 dark:text-amber-200',
        iconColor: 'text-amber-500 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-800/30'
      };
    case 'error':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
        iconColor: 'text-red-500 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-800/30'
      };
  }
};

const AdminNotification: React.FC<AdminNotificationProps> = ({ notification, onClose }) => {
  const { id, type, message, title, autoClose = true, duration = 5000 } = notification;
  const styles = getNotificationStyles(type);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, autoClose, duration, onClose]);

  return (
    <div 
      className={`flex items-start p-4 mb-3 rounded-lg border shadow-sm ${styles.bgColor} ${styles.borderColor} animate-slideInRight`}
      role="alert"
    >
      <div className={`p-2 rounded-lg ${styles.iconBg} mr-3 flex-shrink-0`}>
        <div className={styles.iconColor}>{styles.icon}</div>
      </div>
      
      <div className="flex-1 mr-2">
        {title && <h4 className={`font-semibold ${styles.textColor}`}>{title}</h4>}
        <p className={`text-sm ${styles.textColor}`}>{message}</p>
      </div>
      
      <button 
        onClick={() => onClose(id)} 
        className={`p-1 rounded-full hover:bg-white/20 dark:hover:bg-black/20 ${styles.textColor}`}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Notification Container Component
export const NotificationContainer: React.FC = () => {
  // This component is now just a placeholder for backward compatibility
  // The actual notifications are rendered by the NotificationProvider
  return null;
};

// Create a notification context to manage notifications across the application
const NotificationContext = React.createContext<{
  showNotification: (message: string, type: NotificationType, title?: string, duration?: number) => void;
}>({ 
  showNotification: () => {} 
});

// Create a provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType = 'info', title?: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      id,
      type,
      message,
      title,
      autoClose: true,
      duration: duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove notification after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, newNotification.duration);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-20 right-4 z-50 w-80 space-y-2">
        {notifications.map(notification => (
          <AdminNotification 
            key={notification.id} 
            notification={notification} 
            onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Create a custom hook to use the notification context
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default AdminNotification;