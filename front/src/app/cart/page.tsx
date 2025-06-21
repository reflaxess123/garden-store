"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";

// Импортируем новые компоненты
import { CartItem, type CartItemData } from "@/shared/ui/ecommerce";
import { EmptyState, LoadingState } from "@/shared/ui/states";

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

  // Преобразуем items в нужный формат
  const cartItems: CartItemData[] = items.map((item) => ({
    id: item.cartId,
    name: item.name,
    priceSnapshot: item.priceSnapshot,
    quantity: item.quantity,
    imageUrl: item.imageUrl || undefined,
  }));

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
          <LoadingState
            title="Загрузка корзины..."
            description="Пожалуйста, подождите"
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Корзина пуста"
            description="Добавьте товары из каталога, чтобы начать покупки"
            action={{
              label: "Перейти в каталог",
              onClick: () => router.push("/catalog"),
              variant: "default",
              size: "lg",
            }}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
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
