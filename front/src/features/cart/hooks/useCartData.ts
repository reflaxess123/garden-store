import { CartItem } from "@/entities/cart/types";
import { useAuth } from "@/features/auth/AuthContext";
import { useGetCartApiCartGet } from "@/shared/api/generated/fastAPI";
import { logger } from "@/shared/lib/logger";
import { useMemo } from "react";
import { LocalCartItem, useLocalCart } from "./useLocalCart";

// Хук для получения данных корзины (объединяет локальную и серверную)
export function useCartData() {
  const { isAuthenticated } = useAuth();
  const localCartHook = useLocalCart();

  const { data: serverCartData, isLoading } = useGetCartApiCartGet({
    query: {
      enabled: isAuthenticated,
    },
  });

  const cartItems: CartItem[] = useMemo(() => {
    if (isAuthenticated && serverCartData) {
      return serverCartData.map((item) => ({
        id: item.id,
        cartId: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        name: item.name,
        imageUrl: item.imageUrl || null,
        slug: item.slug,
        description: item.description || null,
        price: item.priceSnapshot.toString(),
      }));
    } else {
      return localCartHook.localCart.map((item: LocalCartItem) => ({
        id: item.productId,
        cartId: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        name: item.name || "Неизвестный товар",
        imageUrl: item.imageUrl || null,
        slug: "",
        description: null,
        price: item.priceSnapshot.toString(),
      }));
    }
  }, [isAuthenticated, serverCartData, localCartHook.localCart]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return (
      Math.round(
        cartItems.reduce(
          (sum, item) => sum + item.priceSnapshot * item.quantity,
          0
        ) * 100
      ) / 100
    ); // Округляем до 2 знаков после запятой
  }, [cartItems]);

  const isEmpty = cartItems.length === 0;

  const getItemByProductId = (productId: string) => {
    return cartItems.find((item) => item.productId === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = getItemByProductId(productId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId);
  };

  // Логирование изменений корзины для аналитики
  useMemo(() => {
    if (cartItems.length > 0) {
      logger.debug("Cart data updated", {
        component: "useCartData",
        itemsCount: cartItems.length,
        totalItems,
        totalAmount,
        isAuthenticated,
      });
    }
  }, [cartItems.length, totalItems, totalAmount, isAuthenticated]);

  return {
    items: cartItems,
    totalItems,
    totalAmount,
    isEmpty,
    isLoading,
    getItemByProductId,
    getItemQuantity,
    isItemInCart,
    // Переиспользуем методы локальной корзины
    localCart: localCartHook.localCart,
    setLocalCart: localCartHook.setLocalCart,
  };
}

// Хук для статистики корзины
export function useCartStats() {
  const { items, totalItems, totalAmount, isEmpty } = useCartData();

  const uniqueProducts = items.length;
  const averageItemPrice = items.length > 0 ? totalAmount / totalItems : 0;

  const mostExpensiveItem =
    items.length > 0
      ? items.reduce(
          (prev, current) =>
            prev.priceSnapshot > current.priceSnapshot ? prev : current,
          items[0]
        )
      : null;

  const cheapestItem =
    items.length > 0
      ? items.reduce(
          (prev, current) =>
            prev.priceSnapshot < current.priceSnapshot ? prev : current,
          items[0]
        )
      : null;

  return {
    uniqueProducts,
    totalItems,
    totalAmount,
    averageItemPrice: Math.round(averageItemPrice * 100) / 100,
    mostExpensiveItem,
    cheapestItem,
    isEmpty,
  };
}
