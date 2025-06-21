"use client";

import { useDeleteOrder } from "@/features/orders/hooks/useOrdersData";
import { OrderCard } from "@/features/orders/ui/OrderCard";
import { OrderInDB } from "@/shared/api/generated/model";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

interface OrdersListProps {
  orders: OrderInDB[];
  onRefetch: () => void;
}

export function OrdersList({ orders, onRefetch }: OrdersListProps) {
  const deleteOrderMutation = useDeleteOrder();

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderMutation.mutateAsync({ data: { orderId } });
      toast.success("Заказ успешно удален");
      onRefetch();
    } catch (error) {
      console.error("Ошибка при удалении заказа:", error);
      toast.error("Не удалось удалить заказ");
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Заказы не найдены</p>
        <p className="text-sm text-muted-foreground mt-2">
          Попробуйте изменить фильтры поиска
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="relative">
          <OrderCard order={order} />
          <div className="absolute top-4 right-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteOrder(order.id)}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
