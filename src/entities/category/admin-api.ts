import { Category } from "@prisma/client";

export type AdminCategory = Category;

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

export async function getAdminCategories(): Promise<Category[]> {
  const res = await fetch("/api/admin/categories");

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error fetching admin categories:", errorData);
    throw new Error(errorData.details || "Failed to fetch admin categories");
  }

  return (await res.json()) as Category[];
}

export async function createAdminCategory(
  payload: CreateCategoryPayload
): Promise<Category> {
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

  return (await res.json()) as Category;
}

export async function updateAdminCategory(
  id: string,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error updating admin category:", errorData);
    throw new Error(errorData.details || "Failed to update admin category");
  }

  return (await res.json()) as Category;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error deleting admin category:", errorData);
    throw new Error(errorData.details || "Failed to delete admin category");
  }
}
