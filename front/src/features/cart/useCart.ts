"use client";

import { useAuth } from "@/features/auth/AuthContext";
import {
  CartItemInDB,
  clearCartApiCartDelete,
  useGetcartapicartget,
} from "@/shared/api/generated";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  priceSnapshot: number;
  quantity: number;
}

interface LocalCartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  priceSnapshot: number;
  quantity: number;
}

// Локальная корзина хук
function useLocalCart() {
  const { isAuthenticated } = useAuth();
  const [localCart, setLocalCart] = useState<LocalCartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("anonymousCart");
      try {
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (e) {
        console.error("Failed to parse anonymous cart from localStorage", e);
        return [];
      }
    }
    return [];
  });

  // Сохраняем локальную корзину в localStorage
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("anonymousCart", JSON.stringify(localCart));
    }
  }, [localCart, isAuthenticated]);

  return { localCart, setLocalCart };
}

// Хук для получения корзины
export function useCartData() {
  const { isAuthenticated } = useAuth();
  const { localCart, setLocalCart } = useLocalCart();

  const { data: serverCartData, isLoading } = useGetcartapicartget({
    enabled: isAuthenticated,
  });

  const cartItems: CartItem[] = useMemo(() => {
    if (isAuthenticated && serverCartData) {
      return serverCartData.map((item: CartItemInDB) => ({
        cartId: item.id,
        productId: item.productId,
        name: `Product ${item.productId}`, // TODO: получать имя продукта
        imageUrl: null, // TODO: получать изображение продукта
        priceSnapshot: item.priceSnapshot,
        quantity: item.quantity,
      }));
    } else {
      return localCart.map((item) => ({
        cartId: item.productId, // Для локальной корзины используем productId как cartId
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        priceSnapshot: item.priceSnapshot,
        quantity: item.quantity,
      }));
    }
  }, [isAuthenticated, serverCartData, localCart]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount =
    Math.round(
      cartItems.reduce(
        (sum, item) => sum + item.priceSnapshot * item.quantity,
        0
      ) * 100
    ) / 100; // Округляем до 2 знаков после запятой

  return {
    items: cartItems,
    totalItems,
    totalAmount,
    isLoading: isAuthenticated ? isLoading : false,
    localCart,
    setLocalCart,
  };
}

// Хук для добавления товара в корзину
export function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productId, quantity }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      return response.json();
    },
    onMutate: async ({ productId, quantity }) => {
      // Оптимистичные обновления для серверной корзины
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      if (previousCart && Array.isArray(previousCart)) {
        const existingItemIndex = previousCart.findIndex(
          (item: CartItemInDB) => item.productId === productId
        );

        let updatedCart;
        if (existingItemIndex >= 0) {
          updatedCart = previousCart.map((item: CartItemInDB, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItemInDB = {
            id: `temp-${productId}-${Date.now()}`,
            productId: productId,
            quantity: quantity,
            priceSnapshot: 0,
            userId: "temp",
          };
          updatedCart = [...previousCart, newItem];
        }

        queryClient.setQueryData(["getCartApiCartGet"], updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },
  });
}

// Хук для обновления количества товара
export function useUpdateCartQuantity() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartId,
      quantity,
    }: {
      cartId: string;
      quantity: number;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update cart item");
      }

      return response.json();
    },
    onMutate: async ({ cartId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      if (previousCart && Array.isArray(previousCart)) {
        const updatedCart = previousCart.map((item: CartItemInDB) =>
          item.id === cartId ? { ...item, quantity } : item
        );
        queryClient.setQueryData(["getCartApiCartGet"], updatedCart);
      }

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },
  });
}

// Хук для удаления товара из корзины
export function useRemoveFromCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      return { success: true };
    },
    onMutate: async (cartId: string) => {
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      if (previousCart && Array.isArray(previousCart)) {
        const updatedCart = previousCart.filter(
          (item: CartItemInDB) => item.id !== cartId
        );
        queryClient.setQueryData(["getCartApiCartGet"], updatedCart);
      }

      return { previousCart };
    },
    onError: (err, cartId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },
  });
}

// Хук для очистки корзины с оптимистичным обновлением
export function useClearCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartApiCartDelete,
    onMutate: async () => {
      // Отменяем все запросы корзины
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      // Сохраняем предыдущее состояние
      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      // Оптимистично очищаем корзину
      queryClient.setQueryData(["getCartApiCartGet"], []);

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Восстанавливаем предыдущее состояние при ошибке
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
    },
    onSettled: () => {
      // Инвалидируем запросы корзины
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },
  });
}

// Основной хук для корзины (заменяет useCart из контекста)
export function useCart() {
  const { isAuthenticated } = useAuth();
  const cartData = useCartData();
  const addToCartMutation = useAddToCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const addItem = (
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    },
    quantity: number
  ) => {
    if (isAuthenticated) {
      addToCartMutation.mutate({ productId: product.id, quantity });
    } else {
      // Обновляем локальную корзину
      const existingItemIndex = cartData.localCart.findIndex(
        (item) => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...cartData.localCart];
        updatedCart[existingItemIndex].quantity += quantity;
        cartData.setLocalCart(updatedCart);
      } else {
        const newItem: LocalCartItem = {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          priceSnapshot: Math.round(product.price * 100) / 100, // Округляем цену до 2 знаков
          quantity,
        };
        cartData.setLocalCart([...cartData.localCart, newItem]);
      }
    }
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartMutation.mutate(cartId);
      return;
    }

    if (isAuthenticated) {
      updateQuantityMutation.mutate({ cartId, quantity });
    } else {
      // Обновляем локальную корзину
      cartData.setLocalCart(
        cartData.localCart.map((item) =>
          item.productId === cartId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (cartId: string) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(cartId);
    } else {
      // Удаляем из локальной корзины
      cartData.setLocalCart(
        cartData.localCart.filter((item) => item.productId !== cartId)
      );
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      // Очищаем серверную корзину с оптимистичным обновлением
      clearCartMutation.mutate();
    } else {
      // Очищаем локальную корзину
      cartData.setLocalCart([]);
    }
  };

  return {
    items: cartData.items,
    totalItems: cartData.totalItems,
    totalAmount: cartData.totalAmount,
    isLoading: cartData.isLoading,
    isMerging: false, // TODO: добавить логику слияния при необходимости
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
