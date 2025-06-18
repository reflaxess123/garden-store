"use client";

import { formatPrice } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
  status: string;
  userId: string;
  order_items: OrderItem[];
}

interface Order {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  totalAmount: number;
  status: string;
  userId: string;
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch orders");
        }
        const data = await res.json();
        setOrders(data);
      } catch (err: unknown) {
        console.error("Error fetching admin orders:", err);
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить заказы."
        );
        toast.error(
          err instanceof Error ? err.message : "Не удалось загрузить заказы."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order status");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Статус заказа успешно обновлен!");
    } catch (err: unknown) {
      console.error("Error updating order status:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Не удалось обновить статус заказа."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    // Эта функция теперь может быть удалена или изменена для других целей
    // так как мы реализуем изменение статуса через handleStatusChange
    toast.info(`Order ${orderId} approved (dummy action)`);
  };

  if (loading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
        <p>Загрузка заказов...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
        <p className="text-destructive">Ошибка: {error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Заказов пока нет.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Заказ #{order.id.slice(0, 8)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(newStatus) =>
                      handleStatusChange(order.id, newStatus)
                    }
                    value={order.status}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Изменить статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">В ожидании</SelectItem>
                      <SelectItem value="processing">В обработке</SelectItem>
                      <SelectItem value="shipped">Отправлен</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                      <SelectItem value="cancelled">Отменен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Пользователь:</strong> {order.fullName} (
                      {order.email})
                    </p>
                    <p>
                      <strong>ID пользователя:</strong> {order.userId}
                    </p>
                    <p>
                      <strong>Дата:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Итого:</strong> {formatPrice(order.totalAmount)}
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
                      {order.order_items.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          )}
                          <span>
                            {item.name} x {item.quantity} (
                            {formatPrice(item.priceSnapshot)})
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
    </main>
  );
}
