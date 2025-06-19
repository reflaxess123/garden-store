"use client";

import { useAuth } from "@/features/auth/AuthContext";
import {
  CartItemInDB,
  useAddtocartapicartaddpost,
  useClearcartapicartdelete,
  useGetcartapicartget,
  useMergecartapicartmergepost,
  useRemovefromcartapicartitemiddelete,
} from "@/shared/api/generated";
import { useMutation } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface CartItem {
  cartId: string; // ID записи CartItem в БД
  productId: string; // ID продукта
  name: string;
  imageUrl: string | null;
  priceSnapshot: number; // Цена на момент добавления в корзину
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: {
      id: string; // ID продукта
      name: string;
      price: number;
      imageUrl: string | null;
    },
    quantity: number
  ) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  isMerging: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  // State for anonymous cart in localStorage
  const [localCart, setLocalCart] = useState<CartItem[]>(() => {
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

  const [isMerging, setIsMerging] = useState(false);

  // Сохраняем локальную корзину в localStorage
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("anonymousCart", JSON.stringify(localCart));
    }
  }, [localCart, isAuthenticated]);

  // Получаем корзину с сервера для авторизованных пользователей
  const { data: serverCartData, isLoading: isCartLoading } =
    useGetcartapicartget({
      enabled: isAuthenticated,
    });

  // Преобразуем данные с сервера в наш формат
  const serverCart: CartItem[] = useMemo(() => {
    if (!serverCartData) return [];

    return serverCartData.map((item: CartItemInDB) => ({
      cartId: item.id,
      productId: item.productId,
      name: `Product ${item.productId}`, // TODO: получать имя продукта
      imageUrl: null, // TODO: получать изображение продукта
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
    }));
  }, [serverCartData]);

  // Мутации для работы с корзиной
  const addMutation = useAddtocartapicartaddpost();
  const removeMutation = useRemovefromcartapicartitemiddelete();
  const clearMutation = useClearcartapicartdelete();
  const mergeMutation = useMergecartapicartmergepost();

  // Создаем собственную мутацию для обновления количества
  const updateMutation = useMutation({
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
    onSuccess: () => {
      // Инвалидируем запрос корзины
      // queryClient.invalidateQueries(['getCart']);
    },
  });

  // Слияние локальной корзины с серверной при входе
  useEffect(() => {
    if (isAuthenticated && localCart.length > 0 && !isMerging) {
      setIsMerging(true);

      mergeMutation.mutate(
        {
          localCart: localCart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
          })),
        },
        {
          onSuccess: () => {
            setLocalCart([]);
            localStorage.removeItem("anonymousCart");
          },
          onError: (error) => {
            console.error("Error merging cart:", error);
          },
          onSettled: () => {
            setIsMerging(false);
          },
        }
      );
    }
  }, [isAuthenticated, localCart, mergeMutation, isMerging]);

  // Текущая корзина (серверная или локальная)
  const currentCart: CartItem[] = useMemo(() => {
    if (isAuthenticated) {
      return serverCart;
    } else {
      return localCart;
    }
  }, [isAuthenticated, serverCart, localCart]);

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
      // Добавляем через API
      addMutation.mutate({
        productId: product.id,
        quantity,
      });
    } else {
      // Добавляем в локальную корзину
      const existingItemIndex = localCart.findIndex(
        (item) => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...localCart];
        updatedCart[existingItemIndex].quantity += quantity;
        setLocalCart(updatedCart);
      } else {
        const newItem: CartItem = {
          cartId: product.id, // Для локальной корзины используем productId как cartId
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          priceSnapshot: product.price,
          quantity,
        };
        setLocalCart([...localCart, newItem]);
      }
    }
  };

  const removeItem = (cartId: string) => {
    if (isAuthenticated) {
      removeMutation.mutate(cartId);
    } else {
      setLocalCart(localCart.filter((item) => item.cartId !== cartId));
    }
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }

    if (isAuthenticated) {
      updateMutation.mutate({
        cartId,
        quantity,
      });
    } else {
      setLocalCart(
        localCart.map((item) =>
          item.cartId === cartId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    if (isAuthenticated) {
      clearMutation.mutate();
    } else {
      setLocalCart([]);
    }
  };

  const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = currentCart.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0
  );

  const isLoading = isAuthenticated ? isCartLoading : false;

  return (
    <CartContext.Provider
      value={{
        items: currentCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isLoading,
        isMerging,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
