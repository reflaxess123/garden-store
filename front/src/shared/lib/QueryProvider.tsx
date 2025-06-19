"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут
            gcTime: 10 * 60 * 1000, // 10 минут
            retry: (failureCount, error) => {
              // Не повторяем запросы для 401/403 ошибок
              if (error instanceof Error && error.message.includes("401")) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <div style={{ position: "fixed", bottom: 0, right: 0, zIndex: 9999 }}>
          {/* React Query DevTools здесь можно добавить позже */}
        </div>
      )}
    </QueryClientProvider>
  );
}
