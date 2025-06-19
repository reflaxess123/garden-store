import { getCategoryBySlug } from "@/entities/category/api";
import { getProductsByCategorySlug } from "@/entities/product/api";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { InfiniteProductList } from "@/widgets/CatalogGrid/InfiniteProductList";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    "category-slug": string;
  };
  searchParams: {
    q?: string;
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const categorySlug = (await params)["category-slug"];
  const searchQuery = (await searchParams).q;

  const category = await getCategoryBySlug(categorySlug);

  if (!category && categorySlug !== "all") {
    notFound();
  }

  const initialProducts = await getProductsByCategorySlug(categorySlug, {
    limit: 20,
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
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center">
        {category?.name || "Все товары"}
      </h1>
      <InfiniteProductList
        initialProducts={initialProducts}
        categorySlug={categorySlug}
        searchQuery={searchQuery}
      />
    </main>
  );
}
