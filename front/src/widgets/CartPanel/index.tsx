"use client";

import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
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
            <Badge className="absolute -right-2 -top-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Корзина
            {mounted && items.length > 0 && (
              <Badge variant="secondary">{items.length}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading || isMerging ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-lg font-medium">Загрузка корзины...</p>
              <p className="text-sm text-gray-400">Пожалуйста, подождите</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xl font-semibold mb-2">Корзина пуста</p>
              <p className="text-sm text-center text-gray-400 mb-6">
                Добавьте товары из каталога,
                <br />
                чтобы начать покупки
              </p>
              <Button
                onClick={() => router.push("/catalog")}
                className="bg-green-600 hover:bg-green-700"
              >
                Перейти в каталог
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Изображение товара */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Информация о товаре */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {item.name}
                      </h3>
                      <p className="text-lg font-bold text-green-600 mb-3">
                        {formatPrice(item.priceSnapshot)}
                      </p>

                      {/* Управление количеством */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium bg-gray-50 border border-gray-200 rounded px-3 py-1">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity + 1)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.cartId)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Общая стоимость за товар */}
                      {item.quantity > 1 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Итого:{" "}
                          <span className="font-semibold">
                            {formatPrice(item.priceSnapshot * item.quantity)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Итоговая информация и кнопка оформления */}
        {items.length > 0 && (
          <div className="border-t pt-4 mt-4 bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {/* Статистика корзины */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Товаров в корзине:</span>
                <span>
                  {items.reduce((sum, item) => sum + item.quantity, 0)} шт.
                </span>
              </div>

              <Separator />

              {/* Общая сумма */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Итого:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              {/* Кнопка оформления заказа */}
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg"
                size="lg"
              >
                Оформить заказ
              </Button>

              {/* Дополнительная информация */}
              <p className="text-xs text-center text-gray-500">
                Доставка рассчитывается на следующем шаге
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;
