import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { Product } from "./api";

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
}

export async function getProductsClient(
  categorySlug: string,
  options?: GetProductsOptions
): Promise<Product[]> {
  const supabase = supabaseClient;
  const {
    limit = 20,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options || {};

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("categories.slug", categorySlug)
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}
