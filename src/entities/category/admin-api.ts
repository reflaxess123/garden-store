import { Category } from "@prisma/client";

export async function getAdminCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories"); // Assuming a general categories API endpoint

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Error fetching admin categories:", errorData);
    throw new Error(errorData.details || "Failed to fetch admin categories");
  }

  return (await res.json()) as Category[];
}
