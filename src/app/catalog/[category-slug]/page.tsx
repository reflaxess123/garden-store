import { getCategoryBySlug } from "@/entities/category/api";
import { getProductsByCategorySlug } from "@/entities/product/api";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { InfiniteProductList } from "@/widgets/CatalogGrid/InfiniteProductList";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    "category-slug": string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = (await params)["category-slug"];

  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const initialProducts = await getProductsByCategorySlug(categorySlug, {
    limit: 20,
  });

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Breadcrumbs
        items={[
          { label: "Каталог", href: "/catalog" },
          { label: category.name, href: `/catalog/${category.slug}` },
        ]}
      />
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center">
        {category.name}
      </h1>
      <InfiniteProductList
        initialProducts={initialProducts}
        categorySlug={category.slug}
      />
    </main>
  );
}
