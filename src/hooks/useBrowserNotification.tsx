import { useState, useEffect, useCallback, useRef } from 'react';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface UseBrowserNotificationReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

export const useBrowserNotification = (): UseBrowserNotificationReturn => {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied'
  );
  const isDocumentVisible = useRef(true);

  useEffect(() => {
    const handleVisibility = () => {
      isDocumentVisible.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== 'granted') return;
      // Only show notification when tab is NOT focused
      if (isDocumentVisible.current) return;

      const notification = new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5s
      setTimeout(() => notification.close(), 5000);
    },
    [isSupported, permission]
  );

  return { permission, requestPermission, sendNotification, isSupported };
};
