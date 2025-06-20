"use client";

import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";

export default function CartPage() {
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
    <main className="container mx-auto p-4 md:p-8">
      <Breadcrumbs items={[{ label: "Корзина", href: "/cart" }]} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 md:h-8 md:w-8" />
          Корзина
          {mounted && items.length > 0 && (
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              {items.length}
            </span>
          )}
        </h1>

        {isLoading || isMerging ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium">Загрузка корзины...</p>
            <p className="text-sm text-muted-foreground">
              Пожалуйста, подождите
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
            <div className="bg-muted/50 rounded-full p-8 mb-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Корзина пуста</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              Добавьте товары из каталога, чтобы начать покупки
            </p>
            <Button
              onClick={() => router.push("/catalog")}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              Перейти в каталог
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-card border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Изображение товара */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-lg border"
                        />
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
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
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
              ))}
            </div>

            {/* Итоговая информация */}
            <div className="lg:col-span-1">
              <div className="bg-card border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Итоги заказа</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Товаров в корзине:</span>
                    <span>
                      {items.reduce((sum, item) => sum + item.quantity, 0)} шт.
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Уникальных товаров:</span>
                    <span>{items.length}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
                  size="lg"
                >
                  Оформить заказ
                </Button>

                <Button
                  onClick={() => router.push("/catalog")}
                  variant="outline"
                  className="w-full mt-3"
                  size="lg"
                >
                  Продолжить покупки
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
