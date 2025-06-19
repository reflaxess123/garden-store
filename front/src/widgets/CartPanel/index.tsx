"use client";

import { Minus, Plus, ShoppingCart, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/CartContext";
import { formatPrice } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { useEffect, useState } from "react";

const CartPanel = () => {
  const {
    items,
    totalAmount,
    removeItem,
    updateQuantity,
    isLoading,
    isMerging,
  } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {mounted && items.length > 0 && (
            <span className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Ваша корзина</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-4">
          {isLoading || isMerging ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg">Загрузка корзины...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <XCircle className="h-12 w-12 mb-4" />
              <p className="text-lg">Ваша корзина пуста</p>
              <p className="text-sm">
                Добавьте что-нибудь, чтобы начать покупки.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.cartId} className="flex items-center space-x-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {formatPrice(item.priceSnapshot)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Уменьшить количество"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center border rounded-md py-1 text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity + 1)
                        }
                        aria-label="Увеличить количество"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.cartId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="mt-auto border-t pt-4">
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Итого:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Button onClick={() => router.push("/checkout")} className="w-full">
              Оформить заказ
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;
