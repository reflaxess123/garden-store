"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useOrdersData } from "@/features/orders/hooks/useOrdersData";
import { useOrdersFilter } from "@/features/orders/hooks/useOrdersFilter";
import { OrdersFilters } from "@/features/orders/ui/OrdersFilters";
import { Button } from "@/shared/ui/button";
import { EmptyOrdersState } from "@/widgets/orders/ui/EmptyOrdersState";
import { OrdersList } from "@/widgets/orders/ui/OrdersList";
import { OrdersStats } from "@/widgets/orders/ui/OrdersStats";
import { AlertCircle, RefreshCw, XCircle } from "lucide-react";

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, stats, isLoading, error, refetch } = useOrdersData();
  const { filters, filteredOrders, updateFilter, clearFilters } =
    useOrdersFilter(orders);

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-8">
          {/* Заголовок с загрузкой */}
          <div className="mb-8">
            <div className="h-8 bg-muted rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
          </div>

          {/* Статистика с загрузкой */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Карточки заказов с загрузкой */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Требуется авторизация
          </h1>
          <p className="text-muted-foreground mb-6">
            Пожалуйста, войдите в систему, чтобы просмотреть свои заказы
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Войти в систему
          </Button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Ошибка загрузки
          </h1>
          <p className="text-muted-foreground mb-6">
            Не удалось загрузить заказы. Пожалуйста, попробуйте еще раз
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить страницу
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои заказы</h1>
          <p className="text-muted-foreground">
            Управление и отслеживание ваших заказов
          </p>
        </div>
      </div>

      {/* Статистика */}
      <OrdersStats stats={stats} isLoading={isLoading} />

      {/* Фильтры */}
      <div className="mb-8">
        <OrdersFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Список заказов */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Загрузка заказов...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrdersState />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Заказы не найдены по заданным фильтрам
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-primary hover:underline"
          >
            Очистить фильтры
          </button>
        </div>
      ) : (
        <OrdersList orders={filteredOrders} onRefetch={refetch} />
      )}
    </div>
  );
}
