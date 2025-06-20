import {
  OrderCreate,
  ProductInDB,
  createOrderApiOrdersPost,
} from "@/shared/api/generated";

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryFilter?: string;
  inStock?: boolean;
  hasDiscount?: boolean;
}

interface OrderItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
}

export async function getProductsClient(
  categorySlug: string,
  options: GetProductsOptions = {}
): Promise<ProductInDB[]> {
  const params = new URLSearchParams();

  if (options.limit) params.append("limit", options.limit.toString());
  if (options.offset) params.append("offset", options.offset.toString());
  if (options.searchQuery) params.append("searchQuery", options.searchQuery);
  if (options.sortBy) params.append("sortBy", options.sortBy);
  if (options.sortOrder) params.append("sortOrder", options.sortOrder);
  if (options.minPrice !== undefined)
    params.append("minPrice", options.minPrice.toString());
  if (options.maxPrice !== undefined)
    params.append("maxPrice", options.maxPrice.toString());
  if (options.categoryFilter)
    params.append("categoryFilter", options.categoryFilter);
  if (options.inStock !== undefined)
    params.append("inStock", options.inStock.toString());
  if (options.hasDiscount !== undefined)
    params.append("hasDiscount", options.hasDiscount.toString());

  const response = await fetch(
    `/api/products/category/${categorySlug}?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const productsInDB = await response.json();
  return productsInDB as ProductInDB[];
}

export async function createOrder(
  fullName: string,
  email: string,
  address: string,
  city: string,
  postalCode: string,
  phone: string,
  items: OrderItem[],
  totalAmount: number
) {
  try {
    const orderData: OrderCreate = {
      full_name: fullName,
      email,
      address,
      city,
      postal_code: postalCode,
      phone,
      total_amount: Math.round(totalAmount * 100) / 100, // Округляем до 2 знаков после запятой
      order_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_snapshot: Math.round(item.priceSnapshot * 100) / 100, // Округляем цену товара тоже
        name: item.name,
        image_url: item.imageUrl || null,
      })),
    };

    const result = await createOrderApiOrdersPost(orderData);
    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
