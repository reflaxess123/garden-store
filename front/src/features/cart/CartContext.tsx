"use client";

import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { useSession } from "@/shared/lib/useSession";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

// Custom useDebouncedCallback hook to avoid external dependency
function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

interface CartItem {
  cartId: string; // ID записи CartItem в БД
  productId: string; // ID продукта
  name: string;
  imageUrl: string | null; // Убеждаемся, что тип string | null
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
      imageUrl: string | null; // Убеждаемся, что тип string | null
    },
    quantity: number
  ) => void;
  removeItem: (cartId: string) => void; // Удаление по cartId (DB cartId или local productId)
  updateQuantity: (cartId: string, quantity: number) => void; // Обновление по cartId (DB cartId или local productId)
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  isMerging: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface SupabaseCartRow {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

interface ExistingCartItemResponse {
  id: string;
  quantity: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isSessionLoading } = useSession();
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      localStorage.setItem("anonymousCart", JSON.stringify(localCart));
    }
  }, [localCart, user]);

  // Fetch user's cart from Supabase
  const { data: serverCart, isLoading: isCartLoading } = useQuery<CartItem[]>({
    queryKey: ["cart", user?.id],
    queryFn: async (): Promise<CartItem[]> => {
      // Явно указываем возвращаемый тип
      if (!user?.id) return [];
      const { data, error } = await supabaseClient
        .from("CartItem")
        .select(
          `
          id,
          productId,
          quantity,
          priceSnapshot,
          product:products (name, imageUrl)
        `
        )
        .eq("userId", user.id);

      if (error) {
        console.error("Error fetching cart:", error.message);
        throw new Error("Failed to fetch cart");
      }

      console.log("Fetched server cart data:", data);

      return (data as unknown as SupabaseCartRow[]).map((item) => ({
        cartId: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        name: item.product.name || "Unknown",
        imageUrl: item.product.imageUrl || null,
      }));
    },
    enabled: !!user?.id,
  });

  const [isMerging, setIsMerging] = useState(false);

  // Merge local cart to server cart on sign-in
  useEffect(() => {
    if (user?.id && localCart.length > 0 && !isMerging) {
      setIsMerging(true);
      const mergeCart = async () => {
        try {
          const response = await fetch("/api/cart/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              localCart: localCart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
              })),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          setLocalCart([]); // Clear local cart after merge
          localStorage.removeItem("anonymousCart");
          queryClient.invalidateQueries({ queryKey: ["cart"] }); // Invalidate cart query to refetch merged cart
        } catch (error) {
          console.error("Error merging cart:", error);
        } finally {
          setIsMerging(false);
        }
      };
      mergeCart();
    }
  }, [user, localCart, queryClient, isMerging]);

  const currentCart: CartItem[] = useMemo(() => {
    // Явно указываем тип
    if (user) {
      return serverCart || [];
    } else {
      return localCart;
    }
  }, [user, serverCart, localCart]);

  const addMutation = useMutation({
    mutationFn: async ({
      product,
      quantity,
    }: {
      product: {
        id: string;
        name: string;
        price: number;
        imageUrl: string | null;
      };
      quantity: number;
    }) => {
      if (user?.id) {
        // Check if item already exists in cart for this user and product
        const { data: existingCartItem, error: fetchError } =
          await supabaseClient
            .from("CartItem")
            .select("id, quantity")
            .eq("userId", user.id)
            .eq("productId", product.id);

        if (fetchError) {
          // PGRST116 means "No rows returned", which is fine for a new item
          console.error("Error fetching existing cart item:", fetchError);
          throw fetchError;
        }

        let result;
        const itemToUpdate = (
          existingCartItem as ExistingCartItemResponse[] | null
        )?.[0]; // Access the first item in the array
        if (itemToUpdate) {
          // If item exists, update its quantity
          const { data, error } = await supabaseClient
            .from("CartItem")
            .update({ quantity: itemToUpdate.quantity + quantity })
            .eq("id", itemToUpdate.id)
            .select(
              "id, productId, quantity, priceSnapshot, product:products(name, imageUrl)"
            );
          if (error) throw error;
          result = (data as unknown as SupabaseCartRow[])[0];
        } else {
          // If item does not exist, insert a new one
          const newId = uuidv4();
          console.log("Attempting to insert CartItem with userId:", user.id);
          const { data, error } = await supabaseClient.from("CartItem").insert({
            id: newId,
            userId: user.id as string,
            productId: product.id,
            quantity: quantity,
            priceSnapshot: product.price,
          });
          if (error) throw error;
          // We need to fetch the newly inserted item separately if we need its details
          // For now, we'll construct a mock result, and then invalidate the query to refetch the cart.
          result = {
            id: newId,
            productId: product.id,
            quantity: quantity,
            priceSnapshot: product.price,
            product: {
              name: product.name,
              imageUrl: product.imageUrl || null,
            },
          } as SupabaseCartRow;
        }

        console.log("Result after CartItem insert/update:", result);

        // Common return format
        return {
          ...result,
          cartId: result.id,
          name: result.product.name || "Unknown",
          imageUrl: result.product.imageUrl || null,
        };
      } else {
        // Handle anonymous cart locally
        const existingLocalItemIndex = localCart.findIndex(
          (item) => item.productId === product.id
        );

        if (existingLocalItemIndex !== -1) {
          // If item exists, update its quantity
          const updatedLocalCart = localCart.map((item, index) =>
            index === existingLocalItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          setLocalCart(updatedLocalCart);
          // For local cart, product name is already available, no need to fetch
          const existingItem = updatedLocalCart.find(
            (item) => item.productId === product.id
          );
          if (existingItem) {
            return {
              ...existingItem,
              name: existingItem.name,
              imageUrl: existingItem.imageUrl,
            };
          }
          throw new Error("Local cart item not found");
        } else {
          // If item does not exist, insert a new one
          const newId = uuidv4();
          const newItem = {
            cartId: newId,
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl || null,
            priceSnapshot: product.price,
            quantity: quantity,
          };
          setLocalCart((prevItems) => [...prevItems, newItem]);
          return newItem;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] }); // Invalidate cart query to refetch after add/update
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (cartId: string) => {
      if (user?.id) {
        const { error } = await supabaseClient
          .from("CartItem")
          .delete()
          .eq("id", cartId)
          .eq("userId", user.id); // Ensure user can only delete their own items
        if (error) throw error;
      } else {
        setLocalCart((prevItems) =>
          prevItems.filter((item) => item.cartId !== cartId)
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] }); // Invalidate cart query to refetch after removal
    },
    onError: (error) => {
      console.error("Error removing from cart:", error);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      cartId,
      quantity,
    }: {
      cartId: string;
      quantity: number;
    }) => {
      if (user?.id) {
        const { data, error } = await supabaseClient
          .from("CartItem")
          .update({ quantity: quantity })
          .eq("id", cartId)
          .eq("userId", user.id) // Ensure user can only update their own items
          .select(
            "id, productId, quantity, priceSnapshot, product:products(name, imageUrl)"
          );
        if (error) throw error;
        return (data as unknown as SupabaseCartRow[])[0]; // Возвращаем обновленный элемент
      } else {
        // Update quantity for existing local item
        const updatedLocalCart = localCart.map((item) =>
          item.cartId === cartId ? { ...item, quantity: quantity } : item
        );
        setLocalCart(updatedLocalCart);
        // For local cart, product name is already available, no need to fetch
        const existingItem = updatedLocalCart.find(
          (item) => item.cartId === cartId
        );
        if (existingItem) {
          return {
            ...existingItem,
            name: existingItem.name,
            imageUrl: existingItem.imageUrl,
          };
        }
        throw new Error("Local cart item not found");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] }); // Invalidate cart query to refetch after update
    },
    onError: (error) => {
      console.error("Error updating quantity:", error);
    },
  });

  const clearCart = () => {
    if (user?.id) {
      // Clear server cart (implement a rpc or loop delete)
      // For simplicity, let's assume you'd have an RPC for this or handle it on server
      supabaseClient
        .from("CartItem")
        .delete()
        .eq("userId", user.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error clearing server cart:", error);
          } else {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
          }
        });
    } else {
      setLocalCart([]);
      localStorage.removeItem("anonymousCart");
    }
  };

  const totalItems = useMemo(() => {
    return currentCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [currentCart]);

  const totalAmount = useMemo(() => {
    return currentCart.reduce(
      (sum, item) => sum + item.quantity * item.priceSnapshot,
      0
    );
  }, [currentCart]);

  const addItem = (
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    },
    quantity: number
  ) => {
    addMutation.mutate({ product, quantity });
  };

  const removeItem = (cartId: string) => {
    removeMutation.mutate(cartId);
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    updateQuantityMutation.mutate({ cartId, quantity });
  };

  const isLoading = isSessionLoading || isCartLoading;

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
