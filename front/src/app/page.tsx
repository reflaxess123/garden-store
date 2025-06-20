import { getAllCategories } from "@/entities/category/api";
import { CategoryCard } from "@/entities/category/ui/CategoryCard";
import { getBestsellers } from "@/entities/product/api";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { CatalogGrid } from "@/widgets/CatalogGrid";

// Отключаем статическую генерацию, т.к. нужны API вызовы
export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getAllCategories();
  const bestsellers = await getBestsellers(4);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Категории</h2>
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">Категории не найдены.</p>
        ) : (
          <CatalogGrid>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </CatalogGrid>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Хиты продаж</h2>
        {bestsellers.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            Нет доступных хитов продаж.
          </p>
        ) : (
          <CatalogGrid>
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </CatalogGrid>
        )}
      </section>
      {/* <AuthButtons /> */}
    </main>
  );
}
