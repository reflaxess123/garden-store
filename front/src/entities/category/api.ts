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
  // Используем переменную окружения для внутреннего URL фронтенда при SSR
  return process.env.FRONTEND_INTERNAL_URL || "http://localhost:3000";
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
