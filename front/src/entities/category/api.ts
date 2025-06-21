import { api, HttpClientError } from "@/shared/api/httpClient";
import { API_ROUTES } from "@/shared/config/api";
import { logger } from "@/shared/lib/logger";
import { BaseEntity } from "@/shared/types/common";

export interface Category extends BaseEntity {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const data = await api.get<Category[]>(API_ROUTES.CATEGORIES.LIST);
    return data;
  } catch (error) {
    logger.apiError(API_ROUTES.CATEGORIES.LIST, error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const data = await api.get<Category>(API_ROUTES.CATEGORIES.BY_ID(id));
    return data;
  } catch (error) {
    if (error instanceof HttpClientError && error.error.status === 404) {
      return null;
    }
    logger.apiError(API_ROUTES.CATEGORIES.BY_ID(id), error, { categoryId: id });
    return null;
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const data = await api.get<Category>(API_ROUTES.CATEGORIES.BY_SLUG(slug));
    return data;
  } catch (error) {
    if (error instanceof HttpClientError && error.error.status === 404) {
      return null;
    }
    logger.apiError(API_ROUTES.CATEGORIES.BY_SLUG(slug), error, { slug });
    return null;
  }
}
