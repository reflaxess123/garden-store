import { useAuth } from "@/features/auth/AuthContext";
import { useGetcartapicartget } from "@/shared/api/generated";
import { logger } from "@/shared/lib/logger";
import { useMemo } from "react";
import { LocalCartItem, useLocalCart } from "./useLocalCart";

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  priceSnapshot: number;
  quantity: number;
}

// Хук для получения данных корзины (объединяет локальную и серверную)
export function useCartData() {
  const { isAuthenticated } = useAuth();
  const localCartHook = useLocalCart();

  const { data: serverCartData, isLoading } = useGetcartapicartget({
    enabled: isAuthenticated,
  });

  const cartItems: CartItem[] = useMemo(() => {
    if (isAuthenticated && serverCartData) {
      return serverCartData.map((item) => ({
        cartId: item.id,
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        priceSnapshot: item.priceSnapshot,
        quantity: item.quantity,
      }));
    } else {
      return localCartHook.localCart.map((item: LocalCartItem) => ({
        cartId: item.productId, // Для локальной корзины используем productId как cartId
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        priceSnapshot: item.priceSnapshot,
        quantity: item.quantity,
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
    isLoading: isAuthenticated ? isLoading : false,
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

  const mostExpensiveItem = items.reduce(
    (prev, current) =>
      prev.priceSnapshot > current.priceSnapshot ? prev : current,
    items[0]
  );

  const cheapestItem = items.reduce(
    (prev, current) =>
      prev.priceSnapshot < current.priceSnapshot ? prev : current,
    items[0]
  );

  return {
    uniqueProducts,
    totalItems,
    totalAmount,
    averageItemPrice: Math.round(averageItemPrice * 100) / 100,
    mostExpensiveItem: isEmpty ? null : mostExpensiveItem,
    cheapestItem: isEmpty ? null : cheapestItem,
    isEmpty,
  };
}
