import { useAuth } from "@/features/auth/AuthContext";
import { logger } from "@/shared/lib/logger";
import { useEffect, useState } from "react";

export interface LocalCartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  priceSnapshot: number;
  quantity: number;
}

export function useLocalCart() {
  const { isAuthenticated } = useAuth();
  const [localCart, setLocalCart] = useState<LocalCartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("anonymousCart");
      try {
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        logger.error(
          "Failed to parse anonymous cart from localStorage",
          error,
          {
            component: "useLocalCart",
            action: "initialization",
          }
        );
        return [];
      }
    }
    return [];
  });

  // Сохраняем локальную корзину в localStorage
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      try {
        localStorage.setItem("anonymousCart", JSON.stringify(localCart));
      } catch (error) {
        logger.error("Failed to save anonymous cart to localStorage", error, {
          component: "useLocalCart",
          action: "save",
        });
      }
    }
  }, [localCart, isAuthenticated]);

  // Очищаем локальную корзину при авторизации
  useEffect(() => {
    if (isAuthenticated && localCart.length > 0) {
      logger.info("User authenticated, clearing local cart", {
        component: "useLocalCart",
        itemsCount: localCart.length,
      });
      // Не очищаем сразу, пусть это сделает логика слияния корзин
    }
  }, [isAuthenticated, localCart.length]);

  const addToLocalCart = (item: LocalCartItem) => {
    setLocalCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (cartItem) => cartItem.productId === item.productId
      );

      if (existingItemIndex >= 0) {
        // Обновляем количество существующего товара
        return prev.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        // Добавляем новый товар
        return [...prev, item];
      }
    });

    logger.userAction("Add to local cart", {
      productId: item.productId,
      quantity: item.quantity,
      component: "useLocalCart",
    });
  };

  const updateLocalCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromLocalCart(productId);
      return;
    }

    setLocalCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );

    logger.userAction("Update local cart quantity", {
      productId,
      quantity,
      component: "useLocalCart",
    });
  };

  const removeFromLocalCart = (productId: string) => {
    setLocalCart((prev) => prev.filter((item) => item.productId !== productId));

    logger.userAction("Remove from local cart", {
      productId,
      component: "useLocalCart",
    });
  };

  const clearLocalCart = () => {
    setLocalCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("anonymousCart");
    }

    logger.userAction("Clear local cart", {
      component: "useLocalCart",
    });
  };

  const getTotalItems = () => {
    return localCart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return (
      Math.round(
        localCart.reduce(
          (sum, item) => sum + item.priceSnapshot * item.quantity,
          0
        ) * 100
      ) / 100
    ); // Округляем до 2 знаков после запятой
  };

  return {
    localCart,
    setLocalCart,
    addToLocalCart,
    updateLocalCartQuantity,
    removeFromLocalCart,
    clearLocalCart,
    getTotalItems,
    getTotalAmount,
  };
}
