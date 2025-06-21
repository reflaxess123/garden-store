import { useAuth } from "@/features/auth/AuthContext";
import { logger } from "@/shared/lib/logger";
import { useCartData } from "./useCartData";
import {
  useAddToCart,
  useClearCart,
  useMergeCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "./useCartMutations";
import { useLocalCart } from "./useLocalCart";

// Главный хук корзины, объединяющий все функциональности
export function useCart() {
  const { isAuthenticated } = useAuth();
  const cartData = useCartData();
  const localCartHook = useLocalCart();

  // Мутации
  const addToCartMutation = useAddToCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const mergeCartMutation = useMergeCart();

  // Добавление товара в корзину (универсальное)
  const addItem = async (
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    },
    quantity: number = 1
  ) => {
    try {
      if (isAuthenticated) {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          quantity,
        });
      } else {
        localCartHook.addToLocalCart({
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          priceSnapshot: product.price,
          quantity,
        });
      }

      logger.userAction("Add item to cart", {
        component: "useCart",
        productId: product.id,
        quantity,
        isAuthenticated,
      });
    } catch (error) {
      logger.error("Failed to add item to cart", error, {
        component: "useCart",
        productId: product.id,
        quantity,
        isAuthenticated,
      });
      throw error;
    }
  };

  // Обновление количества товара
  const updateQuantity = async (cartId: string, quantity: number) => {
    try {
      if (isAuthenticated) {
        await updateQuantityMutation.mutateAsync({ cartId, quantity });
      } else {
        localCartHook.updateLocalCartQuantity(cartId, quantity);
      }

      logger.userAction("Update cart item quantity", {
        component: "useCart",
        cartId,
        quantity,
        isAuthenticated,
      });
    } catch (error) {
      logger.error("Failed to update cart item quantity", error, {
        component: "useCart",
        cartId,
        quantity,
        isAuthenticated,
      });
      throw error;
    }
  };

  // Удаление товара из корзины
  const removeItem = async (cartId: string) => {
    try {
      if (isAuthenticated) {
        await removeFromCartMutation.mutateAsync(cartId);
      } else {
        localCartHook.removeFromLocalCart(cartId);
      }

      logger.userAction("Remove item from cart", {
        component: "useCart",
        cartId,
        isAuthenticated,
      });
    } catch (error) {
      logger.error("Failed to remove item from cart", error, {
        component: "useCart",
        cartId,
        isAuthenticated,
      });
      throw error;
    }
  };

  // Очистка корзины
  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await clearCartMutation.mutateAsync();
      } else {
        localCartHook.clearLocalCart();
      }

      logger.userAction("Clear cart", {
        component: "useCart",
        isAuthenticated,
      });
    } catch (error) {
      logger.error("Failed to clear cart", error, {
        component: "useCart",
        isAuthenticated,
      });
      throw error;
    }
  };

  // Слияние корзин при авторизации
  const mergeLocalCart = async () => {
    if (!isAuthenticated || localCartHook.localCart.length === 0) {
      return;
    }

    try {
      const localCartItems = localCartHook.localCart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await mergeCartMutation.mutateAsync(localCartItems);
      localCartHook.clearLocalCart();

      logger.userAction("Merge local cart with server cart", {
        component: "useCart",
        localItemsCount: localCartItems.length,
      });
    } catch (error) {
      logger.error("Failed to merge local cart", error, {
        component: "useCart",
        localItemsCount: localCartHook.localCart.length,
      });
      throw error;
    }
  };

  // Проверка состояния операций
  const isOperationLoading =
    addToCartMutation.isPending ||
    updateQuantityMutation.isPending ||
    removeFromCartMutation.isPending ||
    clearCartMutation.isPending ||
    mergeCartMutation.isPending;

  return {
    // Данные корзины
    ...cartData,

    // Действия
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    mergeLocalCart,

    // Состояния операций
    isOperationLoading,
    addToCartLoading: addToCartMutation.isPending,
    updateQuantityLoading: updateQuantityMutation.isPending,
    removeItemLoading: removeFromCartMutation.isPending,
    clearCartLoading: clearCartMutation.isPending,
    mergeCartLoading: mergeCartMutation.isPending,

    // Ошибки операций
    addToCartError: addToCartMutation.error,
    updateQuantityError: updateQuantityMutation.error,
    removeItemError: removeFromCartMutation.error,
    clearCartError: clearCartMutation.error,
    mergeCartError: mergeCartMutation.error,

    // Для совместимости со старым кодом
    isMerging: false, // TODO: добавить логику слияния при необходимости
  };
}

// Экспортируем все хуки для удобства
export { useCartData } from "./useCartData";
export type { CartItem } from "./useCartData";
export {
  useAddToCart,
  useClearCart,
  useMergeCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "./useCartMutations";
export { useLocalCart } from "./useLocalCart";
export type { LocalCartItem } from "./useLocalCart";
