import { getAllCategories } from "@/entities/category/api";
import { CategoryCard } from "@/entities/category/ui/CategoryCard";
import { getBestsellers } from "@/entities/product/api";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import Link from "next/link";

export default async function MarketingPage() {
  const categories = await getAllCategories();
  const bestsellers = await getBestsellers(4); // Получаем 4 самых продаваемых товара

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Marketing Landing Page</h1>
      <p>This is a static marketing page.</p>

      <section className="w-full max-w-4xl mt-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Наши Категории</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/catalog/${category.slug}`}>
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full max-w-4xl mt-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Хиты продаж</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {bestsellers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">
              Нет доступных хитов продаж.
            </p>
          ) : (
            bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
