export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Use relative path on client-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export async function getAllCategories(): Promise<Category[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories`);
  if (!response.ok) {
    console.error("Error fetching categories:", response.statusText);
    return [];
  }
  const data = await response.json();
  return data as Category[];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories?slug=${slug}`);
  if (!response.ok) {
    console.error("Error fetching category by slug:", response.statusText);
    return null;
  }
  const data = await response.json();
  return data as Category;
}
