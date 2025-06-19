"use client";

import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
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
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = supabaseClient;
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        setError(
          "Вы не авторизованы. Пожалуйста, войдите, чтобы просмотреть свои заказы."
        );
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("userId", userId)
          .order("createdAt", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          setError(
            "Не удалось загрузить заказы. Пожалуйста, попробуйте еще раз."
          );
          toast.error("Не удалось загрузить заказы.");
        } else {
          setOrders(data as Order[]);
        }
      } catch (err) {
        console.error("Unexpected error fetching orders:", err);
        setError("Произошла непредвиденная ошибка.");
        toast.error("Произошла непредвиденная ошибка.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderToDelete }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Ошибка при удалении заказа");
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== orderToDelete));
        toast.success("Заказ успешно удалён!");
      }
    } catch (e) {
      toast.error("Ошибка при удалении заказа");
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const openDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <p>Загрузка заказов...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <p className="text-destructive">Ошибка: {error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">У вас еще нет заказов.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
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
                  >
                    Удалить
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
                      <strong>Итого:</strong> {formatPrice(order.totalAmount)}
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот заказ? Это действие
              необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
