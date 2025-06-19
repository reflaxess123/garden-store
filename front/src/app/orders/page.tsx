"use client";

import { useAuth } from "@/features/auth/AuthContext";
import {
  OrderInDB,
  useDeleteorderapiordersdelete,
  useGetuserordersapiordersget,
} from "@/shared/api/generated";
import { formatPrice } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
  } = useGetuserordersapiordersget({
    enabled: isAuthenticated,
  });

  const deleteOrderMutation = useDeleteorderapiordersdelete();

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      // Оптимистично удаляем заказ из UI
      queryClient.setQueryData(
        ["getUserOrdersApiOrdersGet"],
        (old: OrderInDB[] | undefined) => {
          if (!old) return [];
          return old.filter((order) => order.id !== orderToDelete);
        }
      );

      await deleteOrderMutation.mutateAsync({
        orderId: orderToDelete,
      });

      toast.success("Заказ успешно удалён!");

      // Инвалидируем кэш для обновления данных
      queryClient.invalidateQueries({
        queryKey: ["getUserOrdersApiOrdersGet"],
      });
    } catch (error) {
      toast.error("Ошибка при удалении заказа");

      // Откатываем оптимистичное обновление при ошибке
      queryClient.invalidateQueries({
        queryKey: ["getUserOrdersApiOrdersGet"],
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const openDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <p>Загрузка заказов...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <p className="text-destructive">
          Вы не авторизованы. Пожалуйста, войдите, чтобы просмотреть свои
          заказы.
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <p className="text-destructive">
          Не удалось загрузить заказы. Пожалуйста, попробуйте еще раз.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
      {!orders || orders.length === 0 ? (
        <p className="text-muted-foreground">У вас еще нет заказов.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: OrderInDB) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Заказ #{order.id.slice(0, 8)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{order.status}</Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(order.id)}
                    disabled={deleteOrderMutation.isPending}
                  >
                    {deleteOrderMutation.isPending ? "Удаление..." : "Удалить"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Дата:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Итого:</strong>{" "}
                      {formatPrice(parseFloat(order.totalAmount))}
                    </p>
                    <p>
                      <strong>Имя:</strong> {order.fullName}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p>
                      <strong>Телефон:</strong> {order.phone}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Адрес:</strong> {order.address}, {order.city},{" "}
                      {order.postalCode}
                    </p>
                    <h3 className="font-semibold mt-2 mb-1">Товары:</h3>
                    <ul className="space-y-1">
                      {order.orderItems?.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          )}
                          <span>
                            {item.name} x{item.quantity} -{" "}
                            {formatPrice(parseFloat(item.priceSnapshot))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить заказ</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот заказ? Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
