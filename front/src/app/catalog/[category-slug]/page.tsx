import { getAllCategories, getCategoryBySlug } from "@/entities/category/api";
import { getProductsByCategorySlug } from "@/entities/product/api";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { CatalogWithFilters } from "@/widgets/CatalogWithFilters";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    "category-slug": string;
  }>;
  searchParams: Promise<{
    q?: string;
    sortBy?: "createdAt" | "price" | "name";
    sortOrder?: "asc" | "desc";
    minPrice?: string;
    maxPrice?: string;
    categoryFilter?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const categorySlug = (await params)["category-slug"];
  const searchQuery = (await searchParams).q;
  const sortBy = (await searchParams).sortBy;
  const sortOrder = (await searchParams).sortOrder;
  const minPrice = (await searchParams).minPrice;
  const maxPrice = (await searchParams).maxPrice;
  const categoryFilter = (await searchParams).categoryFilter;

  const category = await getCategoryBySlug(categorySlug);
  const allCategories = categorySlug === "all" ? await getAllCategories() : [];

  if (!category && categorySlug !== "all") {
    notFound();
  }

  // Оптимизированное получение товаров - один запрос для всех товаров
  const initialProducts = await getProductsByCategorySlug(categorySlug, {
    limit: categorySlug === "all" ? 100 : 20, // Больше товаров только для страницы "all"
    searchQuery: searchQuery || undefined,
  });

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Breadcrumbs
        items={[
          { label: "Каталог", href: "/catalog" },
          {
            label: category?.name || "Все товары",
            href: `/catalog/${categorySlug}`,
          },
        ]}
      />

      <CatalogWithFilters
        initialProducts={initialProducts}
        categorySlug={categorySlug}
        searchQuery={searchQuery}
        currentCategory={category}
        allCategories={allCategories}
        initialFilters={{
          sortBy,
          sortOrder,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          categoryFilter,
        }}
      />
    </main>
  );
}
