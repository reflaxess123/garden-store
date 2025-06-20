"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Placeholder for a loading component. You can replace this with a proper skeleton or spinner.
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}

export function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isLoading, isError, user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Убеждаемся, что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Не выполняем редиректы пока не убедимся что мы на клиенте
    if (!isClient) {
      return;
    }

    // Выполняем редиректы только после завершения загрузки
    if (isLoading) {
      return;
    }

    // Если произошла ошибка при загрузке пользователя (не авторизован)
    if (isError || !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?callback=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Проверяем права админа только для авторизованных пользователей
    if (adminOnly && user && !user.isAdmin) {
      router.replace("/");
      return;
    }
  }, [isLoading, isAuthenticated, isError, user, adminOnly, router, isClient]);

  // Показываем загрузку пока не на клиенте или пока проверяется авторизация
  if (!isClient || isLoading) {
    return <Loading />;
  }

  // Если ошибка авторизации или не авторизован
  if (isError || !isAuthenticated) {
    return null; // Редирект уже запущен
  }

  // Если нужны права админа, но пользователь не админ
  if (adminOnly && (!user || !user.isAdmin)) {
    return null; // Редирект уже запущен
  }

  return <>{children}</>;
}
