// Переадресация на новую рефакторенную версию
export {
  useAddToCartMutation,
  useCart,
  useCartData,
  useClearCart,
  useLocalCart,
  useMergeCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "./hooks";

export type { CartItem, LocalCartItem } from "./hooks";
