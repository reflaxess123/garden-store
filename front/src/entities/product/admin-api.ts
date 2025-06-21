import { logger } from "@/shared";
import { ProductInDB } from "@/shared/api/generated/types";

export interface AdminProductClient extends ProductInDB {
  category?: { name: string };
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  discount?: string | null;
  characteristics?: Record<string, unknown> | null;
  imageUrl?: string | null;
  categoryId: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export async function getAdminProducts(): Promise<ProductInDB[]> {
  try {
    const response = await fetch("/api/admin/products", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error fetching admin products", null, {
        component: "getAdminProducts",
        status: response.status,
        errorData,
      });
      throw new Error(`Failed to fetch admin products: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch admin products", error, {
      component: "getAdminProducts",
    });
    throw error;
  }
}

export async function createAdminProduct(
  payload: CreateProductPayload
): Promise<ProductInDB> {
  try {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error creating admin product", null, {
        component: "createAdminProduct",
        status: response.status,
        errorData,
        payload,
      });
      throw new Error(`Failed to create admin product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to create admin product", error, {
      component: "createAdminProduct",
      payload,
    });
    throw error;
  }
}

export async function updateAdminProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<ProductInDB> {
  try {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error updating admin product", null, {
        component: "updateAdminProduct",
        status: response.status,
        errorData,
        id,
        payload,
      });
      throw new Error(`Failed to update admin product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error("Failed to parse error response", error, {
        component: "updateAdminProduct",
        id,
      });
    } else {
      logger.error("Failed to update admin product", error, {
        component: "updateAdminProduct",
        id,
        payload,
      });
    }
    throw error;
  }
}

export async function deleteAdminProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Error deleting admin product", null, {
        component: "deleteAdminProduct",
        status: response.status,
        errorData,
        id,
      });
      throw new Error(`Failed to delete admin product: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error("Failed to parse error response", error, {
        component: "deleteAdminProduct",
        id,
      });
    } else {
      logger.error("Failed to delete admin product", error, {
        component: "deleteAdminProduct",
        id,
      });
    }
    throw error;
  }
}
