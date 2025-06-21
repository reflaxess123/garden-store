import { api, HttpClientError } from "@/shared/api/httpClient";
import { API_ROUTES } from "@/shared/config/api";
import { logger } from "@/shared/lib/logger";
import { BaseEntity, ListParams } from "@/shared/types/common";

export interface Product extends BaseEntity {
  slug: string;
  name: string;
  description: string | null;
  price: string;
  discount: string | null;
  characteristics: Record<string, unknown> | null;
  imageUrl: string | null;
  categoryId: string;
  category?: { name: string; slug: string; id: string };
  timesOrdered: number;
}

interface GetProductsOptions extends ListParams {
  sortBy?: "createdAt" | "price" | "name";
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await api.get<Product>(API_ROUTES.PRODUCTS.BY_SLUG(slug));
    return data;
  } catch (error) {
    if (error instanceof HttpClientError && error.error.status === 404) {
      return null;
    }
    logger.apiError(API_ROUTES.PRODUCTS.BY_SLUG(slug), error, { slug });
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const data = await api.get<Product>(API_ROUTES.PRODUCTS.BY_ID(id));
    return data;
  } catch (error) {
    if (error instanceof HttpClientError && error.error.status === 404) {
      return null;
    }
    logger.apiError(API_ROUTES.PRODUCTS.BY_ID(id), error, { productId: id });
    return null;
  }
}

export async function getBestsellers(limit: number = 10): Promise<Product[]> {
  try {
    const data = await api.get<Product[]>(
      `${API_ROUTES.PRODUCTS.BESTSELLERS}?limit=${limit}`,
      {
        cache: "no-store" as any, // TypeScript workaround для cache опции
      }
    );
    return data;
  } catch (error) {
    logger.apiError(API_ROUTES.PRODUCTS.BESTSELLERS, error, { limit });
    return [];
  }
}

export async function getProducts(
  options: GetProductsOptions = {}
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();

    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);
    if (options.searchQuery) params.append("searchQuery", options.searchQuery);

    const endpoint = `${API_ROUTES.PRODUCTS.LIST}?${params.toString()}`;
    const data = await api.get<Product[]>(endpoint);
    return data;
  } catch (error) {
    logger.apiError(API_ROUTES.PRODUCTS.LIST, error, { options });
    return [];
  }
}

export async function getProductsByCategory(
  categorySlug: string,
  options: GetProductsOptions = {}
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();

    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);
    if (options.searchQuery) params.append("searchQuery", options.searchQuery);

    const endpoint = `${API_ROUTES.PRODUCTS.BY_CATEGORY(
      categorySlug
    )}?${params.toString()}`;
    const data = await api.get<Product[]>(endpoint);
    return data;
  } catch (error) {
    logger.apiError(API_ROUTES.PRODUCTS.BY_CATEGORY(categorySlug), error, {
      categorySlug,
      options,
    });
    return [];
  }
}
