"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useNotificationToasts } from "./useNotificationToasts";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  // Всегда вызываем хук, но передаем флаг активности
  useNotificationToasts(isAuthenticated);

  return <>{children}</>;
}
