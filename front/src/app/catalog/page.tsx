import { getAllCategories } from "@/entities/category/api";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { UnifiedCatalog } from "@/widgets/UnifiedCatalog";

interface CatalogPageProps {
  searchParams: Promise<{
    q?: string;
    sortBy?: "createdAt" | "price" | "name";
    sortOrder?: "asc" | "desc";
    minPrice?: string;
    maxPrice?: string;
    categories?: string; // Массив ID категорий через запятую
    inStock?: string;
    hasDiscount?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const searchQuery = (await searchParams).q;
  const sortBy = (await searchParams).sortBy;
  const sortOrder = (await searchParams).sortOrder;
  const minPrice = (await searchParams).minPrice;
  const maxPrice = (await searchParams).maxPrice;
  const categories = (await searchParams).categories;
  const inStock = (await searchParams).inStock;
  const hasDiscount = (await searchParams).hasDiscount;

  // Получаем все категории для фильтра
  const allCategories = await getAllCategories();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Breadcrumbs items={[{ label: "Каталог", href: "/catalog" }]} />

      <UnifiedCatalog
        allCategories={allCategories}
        initialFilters={{
          searchQuery,
          sortBy,
          sortOrder,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          categories: categories ? categories.split(",") : [],
          inStock: inStock === "true",
          hasDiscount: hasDiscount === "true",
        }}
      />
    </main>
  );
}
