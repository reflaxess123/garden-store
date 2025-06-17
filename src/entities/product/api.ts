import { createSupabaseServerClient } from "@/shared/api/supabaseClient";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  discount: number | null;
  characteristics: Record<string, unknown> | null;
  imageUrl: string | null;
  categoryId: string;
  category?: { name: string; slug: string; id: string };
  createdAt: string;
  updatedAt: string;
}

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  options?: GetProductsOptions
): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const {
    limit = 20,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options || {};

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)") // Включаем информацию о категории
    .eq("categories.slug", categorySlug) // Фильтруем по слагу категории
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }

  return data as Product;
}
