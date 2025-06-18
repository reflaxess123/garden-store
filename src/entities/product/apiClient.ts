import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { Product } from "./api";

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
  searchQuery?: string;
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
    searchQuery,
  } = options || {};

  let queryBuilder = supabase
    .from("products")
    .select("*, categories(name)")
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  if (categorySlug !== "all") {
    queryBuilder = queryBuilder.eq("categories.slug", categorySlug);
  }

  if (searchQuery) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}
