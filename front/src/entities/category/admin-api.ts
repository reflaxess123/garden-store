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
  const res = await fetch("/api/admin/categories");

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error fetching admin categories:", errorData);
    throw new Error(errorData.details || "Failed to fetch admin categories");
  }

  return (await res.json()) as CategoryInDB[];
}

export async function createAdminCategory(
  payload: CreateCategoryPayload
): Promise<CategoryInDB> {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error creating admin category:", errorData);
    throw new Error(errorData.details || "Failed to create admin category");
  }

  return (await res.json()) as CategoryInDB;
}

export async function updateAdminCategory(
  id: string,
  payload: UpdateCategoryPayload
): Promise<CategoryInDB> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      console.error("Error updating admin category:", errorData);
      errorMessage = errorData.details || errorData.error || errorMessage;
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as CategoryInDB;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      console.error("Error deleting admin category:", errorData);
      errorMessage = errorData.details || errorData.error || errorMessage;
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    throw new Error(errorMessage);
  }

  // Не пытаемся парсить JSON для статуса 204 No Content
}
