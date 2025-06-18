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

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Use relative path on client-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

interface GetProductsOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
  searchQuery?: string;
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  options?: GetProductsOptions
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());
  if (options?.sortBy) params.append("sortBy", options.sortBy);
  if (options?.sortOrder) params.append("sortOrder", options.sortOrder);
  if (options?.searchQuery) params.append("searchQuery", options.searchQuery);

  const baseUrl = getBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/products/category/${categorySlug}?${params.toString()}`
  );
  if (!response.ok) {
    console.error("Error fetching products by category:", response.statusText);
    return [];
  }
  const data = await response.json();
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/slug/${slug}`);
  if (!response.ok) {
    console.error("Error fetching product by slug:", response.statusText);
    return null;
  }
  const data = await response.json();
  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/${id}`);
  if (!response.ok) {
    console.error("Error fetching product:", response.statusText);
    return null;
  }
  const data = await response.json();
  return data as Product;
}

export async function getBestsellers(limit: number = 10): Promise<Product[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/products/bestsellers?limit=${limit}`
  );
  if (!response.ok) {
    console.error("Error fetching bestsellers:", response.statusText);
    return [];
  }
  const data = await response.json();
  return data as Product[];
}
