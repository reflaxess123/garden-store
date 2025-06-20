// Автоматически сгенерированные типы из OpenAPI схемы
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ

export interface CartItemAdd {
  productId: string;
  quantity?: number;
}

export interface CartItemInDB {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  priceSnapshot: number;
}

export interface CartItemUpdate {
  quantity: number;
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  slug: string;
  description?: any;
  imageUrl?: any;
  categoryId: string;
}

export interface CartMergeRequest {
  localCart: LocalCartItem[];
}

export interface CategoryCreate {
  name: string;
  slug: string;
  description?: any;
  image_url?: any;
}

export interface CategoryInDB {
  name: string;
  slug: string;
  description?: any;
  imageUrl?: any;
  id: string;
}

export interface CategoryUpdate {
  name?: any;
  slug?: any;
  description?: any;
  image_url?: any;
}

export interface CustomUser {
  id: string;
  email: string;
  fullName?: any;
  isAdmin: boolean;
}

export interface FavouriteInDB {
  productId: string;
  id: string;
  userId: string;
  product?: any;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface LocalCartItem {
  productId: string;
  quantity: number;
  priceSnapshot: any;
}

export interface OrderCreate {
  full_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  total_amount: any;
  order_items: OrderItemCreate[];
}

export interface OrderDelete {
  orderId: string;
}

export interface OrderInDB {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  totalAmount: string;
  orderItems?: OrderItemInDB[];
  id: string;
  userId: string;
  status: string;
  createdAt: string;
}

export interface OrderItemCreate {
  product_id: string;
  quantity: number;
  price_snapshot: any;
  name: string;
  image_url?: any;
}

export interface OrderItemInDB {
  productId: string;
  quantity: number;
  priceSnapshot: string;
  name: string;
  imageUrl?: any;
  id: string;
  orderId: string;
}

export interface OrderUpdateStatus {
  status: string;
}

export interface ProductCreate {
  name: string;
  slug: string;
  description?: any;
  price: any;
  discount?: any;
  characteristics?: any;
  image_url?: any;
  category_id: string;
}

export interface ProductInDB {
  name: string;
  slug: string;
  description?: any;
  price: string;
  discount?: any;
  characteristics?: any;
  imageUrl?: any;
  categoryId: string;
  id: string;
  category?: any;
  createdAt: string;
  updatedAt?: any;
  timesOrdered: number;
}

export interface ProductUpdate {
  name?: any;
  slug?: any;
  description?: any;
  price?: any;
  discount?: any;
  characteristics?: any;
  image_url?: any;
  categoryId?: any;
}

export interface ResetPasswordSchema {
  email: string;
}

export interface SignInSchema {
  email: string;
  password: string;
}

export interface SignUpSchema {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Token {
  access_token: string;
  token_type?: string;
}

export interface UpdatePasswordSchema {
  password: string;
}

export interface ValidationError {
  loc: any[];
  msg: string;
  type: string;
}
