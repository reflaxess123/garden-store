import { logger } from "@/shared";
import { ProductInDB } from "@/shared/api/generated";

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
  orderData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Error creating order", null, {
        component: "createOrder",
        status: response.status,
        errorText,
        orderData,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error creating order", error, {
      component: "createOrder",
      orderData,
    });
    throw error;
  }
}
