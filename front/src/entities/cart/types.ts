/**
 * Типы для корзины
 */

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
  slug?: string;
  description?: string | null;
  // Обязательное поле для совместимости
  cartId: string;
  price?: string;
}

export interface LocalCartItem {
  productId: string;
  quantity: number;
  price: string;
  name?: string;
  imageUrl?: string | null;
  slug?: string;
  description?: string | null;
}

export interface CartItemWithProduct extends CartItem {
  product?: {
    id: string;
    name: string;
    price: string;
    imageUrl?: string | null;
    slug?: string;
    description?: string | null;
  };
}

export interface CartItemData {
  id: string;
  name: string;
  priceSnapshot: number;
  quantity: number;
  imageUrl?: string;
}
