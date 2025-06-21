"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Edit,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { usePaginatedList } from "@/features/admin-common/hooks";
import {
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  StatsCard,
  StatsGrid,
} from "@/features/admin-common/ui";
import { OrderEditModal } from "@/features/admin-orders/ui";
import { formatPrice } from "@/shared";

// Типы данных
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  priceSnapshot: string;
  imageUrl?: string;
}

interface Order {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

// Статус бейдж для заказов
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: "Ожидает", variant: "secondary" as const },
    processing: { label: "В обработке", variant: "default" as const },
    shipped: { label: "Отправлен", variant: "outline" as const },
    delivered: { label: "Доставлен", variant: "default" as const },
    cancelled: { label: "Отменен", variant: "destructive" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "secondary" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Модальное окно аналитики
interface OrderAnalyticsModalProps {
  orders: Order[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function OrderAnalyticsModal({
  orders,
  open,
  onOpenChange,
}: OrderAnalyticsModalProps) {
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    ),
    avgOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + Number(order.totalAmount), 0) /
          orders.length
        : 0,
    statusBreakdown: orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Аналитика заказов</DialogTitle>
          <DialogDescription>Статистика и анализ заказов</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Общая статистика */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalOrders}
              </div>
              <p className="text-sm text-muted-foreground">Всего заказов</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(stats.totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">Общая выручка</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(stats.avgOrderValue)}
              </div>
              <p className="text-sm text-muted-foreground">Средний чек</p>
            </div>
          </div>

          {/* Разбивка по статусам */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Статусы заказов</h3>
            <div className="space-y-2">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <OrderStatusBadge status={status} />
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// API функции
async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/admin/orders");
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch orders");
  }
  return res.json();
}

async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const res = await fetch(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update order status");
  }
}

export default function AdminOrdersPage() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Загрузка заказов
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["adminOrders"],
    queryFn: fetchOrders,
  });

  // Пагинация и фильтрация
  const {
    data: paginatedOrders,
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    filters,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    isEmpty,
  } = usePaginatedList(orders, {
    itemsPerPage: 20,
    searchFields: ["id", "fullName", "email", "phone"],
  });

  // Мутация для обновления статуса
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Статус заказа обновлен!");
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении статуса");
    },
  });

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleSaveOrder = async (
    orderId: string,
    items: OrderItem[],
    totalAmount: number
  ) => {
    try {
      // Здесь должна быть логика сохранения заказа
      toast.success("Заказ успешно обновлен!");
      setShowEditModal(false);
      refetch();
    } catch (error) {
      toast.error("Ошибка при обновлении заказа");
    }
  };

  const handleStatusChange = (order: Order) => {
    const newStatus = prompt("Новый статус:", order.status);
    if (newStatus && newStatus !== order.status) {
      updateStatusMutation.mutate({
        orderId: order.id,
        status: newStatus,
      });
    }
  };

  // Статистика
  const statsCards: StatsCard[] = [
    {
      title: "Всего заказов",
      value: orders.length,
      icon: Package,
    },
    {
      title: "Общая выручка",
      value: formatPrice(
        orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
      ),
      icon: TrendingUp,
    },
    {
      title: "Средний чек",
      value:
        orders.length > 0
          ? formatPrice(
              orders.reduce(
                (sum, order) => sum + Number(order.totalAmount),
                0
              ) / orders.length
            )
          : formatPrice(0),
      icon: TrendingUp,
    },
    {
      title: "В обработке",
      value: orders.filter((order) => order.status === "processing").length,
      icon: TrendingDown,
      description: "Требуют внимания",
    },
  ];

  // Фильтры
  const orderFilters = [
    {
      value: filters.status || "",
      onChange: (value: string) => handleFilterChange("status", value),
      options: [
        { value: "", label: "Все статусы" },
        { value: "pending", label: "Ожидает" },
        { value: "processing", label: "В обработке" },
        { value: "shipped", label: "Отправлен" },
        { value: "delivered", label: "Доставлен" },
        { value: "cancelled", label: "Отменен" },
      ],
      placeholder: "Выберите статус",
      label: "Статус",
    },
  ];

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Ошибка загрузки заказов
          </h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Неизвестная ошибка"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Заголовок */}
      <AdminPageHeader
        title="Управление заказами"
        description="Просматривайте и управляйте заказами клиентов"
        actions={
          <Button variant="outline" onClick={() => setShowAnalytics(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Аналитика
          </Button>
        }
      />

      {/* Статистика */}
      <StatsGrid cards={statsCards} loading={isLoading} />

      {/* Фильтры */}
      <AdminFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={orderFilters}
        onClearFilters={clearFilters}
      />

      {/* Таблица заказов */}
      <Card>
        <CardHeader>
          <CardTitle>Заказы ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Заказы не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID заказа</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Товары</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {order.id.slice(-8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{order.orderItems.length} шт.</span>
                          {order.orderItems.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="w-8 h-8 relative rounded overflow-hidden"
                            >
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                                  ?
                                </div>
                              )}
                            </div>
                          ))}
                          {order.orderItems.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{order.orderItems.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatPrice(Number(order.totalAmount))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(order)}
                          >
                            Статус
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={totalItems}
        />
      )}

      {/* Модальные окна */}
      <OrderAnalyticsModal
        orders={orders}
        open={showAnalytics}
        onOpenChange={setShowAnalytics}
      />

      <OrderEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        order={selectedOrder}
        onSave={handleSaveOrder}
      />
    </div>
  );
}
