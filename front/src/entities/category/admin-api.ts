import { logger } from "@/shared";
import { CategoryInDB } from "@/shared/api/generated/types";

export type AdminCategory = CategoryInDB;

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
}

export async function getAdminCategories(): Promise<CategoryInDB[]> {
  try {
    const response = await fetch("/api/admin/categories", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error fetching admin categories", null, {
        component: "getAdminCategories",
        status: response.status,
        errorData,
      });
      throw new Error(`Failed to fetch admin categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch admin categories", error, {
      component: "getAdminCategories",
    });
    throw error;
  }
}

export async function createAdminCategory(
  payload: CreateCategoryPayload
): Promise<CategoryInDB> {
  try {
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error creating admin category", null, {
        component: "createAdminCategory",
        status: response.status,
        errorData,
        payload,
      });
      throw new Error(`Failed to create admin category: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to create admin category", error, {
      component: "createAdminCategory",
      payload,
    });
    throw error;
  }
}

export async function updateAdminCategory(
  id: string,
  payload: UpdateCategoryPayload
): Promise<CategoryInDB> {
  try {
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error updating admin category", null, {
        component: "updateAdminCategory",
        status: response.status,
        errorData,
        id,
        payload,
      });
      throw new Error(`Failed to update admin category: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error("Failed to parse error response", error, {
        component: "updateAdminCategory",
        id,
      });
    } else {
      logger.error("Failed to update admin category", error, {
        component: "updateAdminCategory",
        id,
        payload,
      });
    }
    throw error;
  }
}

export async function deleteAdminCategory(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error deleting admin category", null, {
        component: "deleteAdminCategory",
        status: response.status,
        errorData,
        id,
      });
      throw new Error(`Failed to delete admin category: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error("Failed to parse error response", error, {
        component: "deleteAdminCategory",
        id,
      });
    } else {
      logger.error("Failed to delete admin category", error, {
        component: "deleteAdminCategory",
        id,
      });
    }
    throw error;
  }
}
