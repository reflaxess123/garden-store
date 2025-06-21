"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import FormModal from "@/features/admin-common/ui/FormModal";
import { formatPrice } from "@/shared/lib/utils";

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

export interface OrderEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSave: (orderId: string, items: OrderItem[], totalAmount: number) => void;
}

export default function OrderEditModal({
  open,
  onOpenChange,
  order,
  onSave,
}: OrderEditModalProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setItems([...order.orderItems]);
    }
  }, [order]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + Number(item.priceSnapshot) * item.quantity;
    }, 0);
  };

  const handleSave = async () => {
    if (!order || items.length === 0) {
      toast.error("Заказ должен содержать хотя бы один товар");
      return;
    }

    setIsSaving(true);
    try {
      const totalAmount = calculateTotal();
      await onSave(order.id, items, totalAmount);
      onOpenChange(false);
      toast.success("Заказ успешно обновлен!");
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Ошибка при сохранении заказа");
    } finally {
      setIsSaving(false);
    }
  };

  if (!order) return null;

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Редактирование заказа"
      description={`Заказ #${order.id.slice(-8)} от ${order.fullName}`}
      size="lg"
      onSubmit={handleSave}
      loading={isSaving}
      submitText="Сохранить изменения"
    >
      <div className="space-y-6">
        {/* Информация о заказе */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Клиент</Label>
            <p className="text-sm">{order.fullName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm">{order.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Телефон</Label>
            <p className="text-sm">{order.phone}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Дата заказа</Label>
            <p className="text-sm">
              {new Date(order.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>

        {/* Товары в заказе */}
        <div>
          <Label className="text-lg font-semibold">Товары в заказе</Label>
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                {/* Изображение товара */}
                <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                      Нет фото
                    </div>
                  )}
                </div>

                {/* Информация о товаре */}
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Цена: {formatPrice(Number(item.priceSnapshot))}
                  </p>
                </div>

                {/* Управление количеством */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.id,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Стоимость позиции */}
                <div className="text-right min-w-[80px]">
                  <p className="font-medium">
                    {formatPrice(Number(item.priceSnapshot) * item.quantity)}
                  </p>
                </div>

                {/* Кнопка удаления */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length <= 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Итоговая сумма */}
        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
          <span className="text-lg font-semibold">Итого:</span>
          <span className="text-xl font-bold text-primary">
            {formatPrice(calculateTotal())}
          </span>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Все товары удалены из заказа
          </div>
        )}
      </div>
    </FormModal>
  );
}
