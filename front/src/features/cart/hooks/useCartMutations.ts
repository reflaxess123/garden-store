import { useAuth } from "@/features/auth/AuthContext";
import { CartItemWithProduct } from "@/shared/api/generated";
import { api } from "@/shared/api/httpClient";
import { API_ROUTES } from "@/shared/config/api";
import { logger } from "@/shared/lib/logger";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      return await api.post(API_ROUTES.CART.ADD, { productId, quantity });
    },

    onMutate: async ({ productId, quantity }) => {
      // Оптимистичные обновления для серверной корзины
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      if (previousCart && Array.isArray(previousCart)) {
        const existingItemIndex = previousCart.findIndex(
          (item: CartItemWithProduct) => item.productId === productId
        );

        let updatedCart;
        if (existingItemIndex >= 0) {
          updatedCart = previousCart.map((item: CartItemWithProduct, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Для нового товара создаем временный элемент с минимальными данными
          const newItem: CartItemWithProduct = {
            id: `temp-${productId}-${Date.now()}`,
            productId: productId,
            userId: "temp",
            quantity: quantity,
            priceSnapshot: 0,
            name: "Загрузка...",
            slug: "",
            description: null,
            imageUrl: null,
            categoryId: "",
          };
          updatedCart = [...previousCart, newItem];
        }

        queryClient.setQueryData(["getCartApiCartGet"], updatedCart);
      }

      return { previousCart };
    },

    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
      logger.apiError(API_ROUTES.CART.ADD, error, {
        component: "useAddToCart",
        productId: variables.productId,
        quantity: variables.quantity,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },

    onSuccess: (data, variables) => {
      logger.userAction("Add to cart", {
        component: "useAddToCart",
        productId: variables.productId,
        quantity: variables.quantity,
      });
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
      return await api.patch(API_ROUTES.CART.UPDATE(cartId), { quantity });
    },

    onMutate: async ({ cartId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      if (previousCart && Array.isArray(previousCart)) {
        const updatedCart = previousCart.map((item: CartItemWithProduct) =>
          item.id === cartId ? { ...item, quantity } : item
        );
        queryClient.setQueryData(["getCartApiCartGet"], updatedCart);
      }

      return { previousCart };
    },

    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
      logger.apiError(API_ROUTES.CART.UPDATE(variables.cartId), error, {
        component: "useUpdateCartQuantity",
        cartId: variables.cartId,
        quantity: variables.quantity,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },

    onSuccess: (data, variables) => {
      logger.userAction("Update cart quantity", {
        component: "useUpdateCartQuantity",
        cartId: variables.cartId,
        quantity: variables.quantity,
      });
    },
  });
}

// Хук для удаления товара из корзины
export function useRemoveFromCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId: string) => {
      return await api.delete(API_ROUTES.CART.REMOVE(cartId));
    },

    onMutate: async (cartId) => {
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });

      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      if (previousCart && Array.isArray(previousCart)) {
        const updatedCart = previousCart.filter(
          (item: CartItemWithProduct) => item.id !== cartId
        );
        queryClient.setQueryData(["getCartApiCartGet"], updatedCart);
      }

      return { previousCart };
    },

    onError: (error, cartId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
      logger.apiError(API_ROUTES.CART.REMOVE(cartId), error, {
        component: "useRemoveFromCart",
        cartId,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },

    onSuccess: (data, cartId) => {
      logger.userAction("Remove from cart", {
        component: "useRemoveFromCart",
        cartId,
      });
    },
  });
}

// Хук для очистки корзины
export function useClearCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.delete(API_ROUTES.CART.CLEAR);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["getCartApiCartGet"] });
      const previousCart = queryClient.getQueryData(["getCartApiCartGet"]);

      // Оптимистично очищаем корзину
      queryClient.setQueryData(["getCartApiCartGet"], []);

      return { previousCart };
    },

    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["getCartApiCartGet"], context.previousCart);
      }
      logger.apiError(API_ROUTES.CART.CLEAR, error, {
        component: "useClearCart",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
    },

    onSuccess: () => {
      logger.userAction("Clear cart", {
        component: "useClearCart",
      });
    },
  });
}

// Хук для слияния корзин (при авторизации)
export function useMergeCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      localCartItems: Array<{
        productId: string;
        quantity: number;
      }>
    ) => {
      return await api.post(API_ROUTES.CART.MERGE, { items: localCartItems });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCartApiCartGet"] });
      logger.userAction("Merge carts", {
        component: "useMergeCart",
      });
    },

    onError: (error) => {
      logger.apiError(API_ROUTES.CART.MERGE, error, {
        component: "useMergeCart",
      });
    },
  });
}
