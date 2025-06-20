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

export async function getAdminProducts(): Promise<AdminProductClient[]> {
  const res = await fetch("/api/admin/products");

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error fetching admin products:", errorData);
    throw new Error(errorData.details || "Failed to fetch admin products");
  }

  return (await res.json()) as AdminProductClient[];
}

export async function createAdminProduct(
  payload: CreateProductPayload
): Promise<AdminProductClient> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error creating admin product:", errorData);
    throw new Error(errorData.details || "Failed to create admin product");
  }

  return (await res.json()) as AdminProductClient;
}

export async function updateAdminProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<AdminProductClient> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      console.error("Error updating admin product:", errorData);
      errorMessage = errorData.details || errorData.error || errorMessage;
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as AdminProductClient;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      console.error("Error deleting admin product:", errorData);
      errorMessage = errorData.details || errorData.error || errorMessage;
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    throw new Error(errorMessage);
  }

  // Не пытаемся парсить JSON для статуса 204 No Content
  // return (await res.json()) as AdminProductClient;
}
