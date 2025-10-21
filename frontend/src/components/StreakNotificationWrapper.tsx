import { useStreakNotifications } from '@/hooks/useStreakNotifications';

interface StreakNotificationWrapperProps {
  children: React.ReactNode;
}

export function StreakNotificationWrapper({ children }: StreakNotificationWrapperProps) {
  useStreakNotifications();
  return <>{children}</>;
}

