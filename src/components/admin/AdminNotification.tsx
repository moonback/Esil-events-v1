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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Example function to add a notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Example usage
  useEffect(() => {
    // This is just for demonstration
    const demoNotification = {
      type: 'info' as NotificationType,
      message: 'Bienvenue dans votre tableau de bord administrateur',
      title: 'Bonjour',
      autoClose: true,
      duration: 5000
    };

    // Uncomment to see a demo notification
    // addNotification(demoNotification);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 w-80 space-y-2">
      {notifications.map(notification => (
        <AdminNotification 
          key={notification.id} 
          notification={notification} 
          onClose={removeNotification} 
        />
      ))}
    </div>
  );
};

export default AdminNotification;