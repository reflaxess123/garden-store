"use client";

import { formatPrice } from "@/shared";
import { Button } from "@/shared/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";

export interface CartItemData {
  id: string;
  name: string;
  priceSnapshot: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  className = "",
}: CartItemProps) {
  return (
    <div
      className={`bg-card border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex gap-4">
        {/* Изображение товара */}
        <div className="flex-shrink-0">
          {item.imageUrl ? (
            <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-lg border overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 md:h-24 md:w-24 bg-muted rounded-lg border flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {item.name}
          </h3>
          <p className="text-xl font-bold text-primary mb-4">
            {formatPrice(item.priceSnapshot)}
          </p>

          {/* Управление количеством и удаление */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium bg-muted border rounded px-3 py-1">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Общая стоимость за товар */}
          {item.quantity > 1 && (
            <div className="mt-3 text-sm text-muted-foreground">
              Итого за товар:{" "}
              <span className="font-semibold text-foreground">
                {formatPrice(item.priceSnapshot * item.quantity)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
