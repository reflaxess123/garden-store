import { getAllCategories } from "@/entities/category/api";
import { CategoryCard } from "@/entities/category/ui/CategoryCard";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { CatalogGrid } from "@/widgets/CatalogGrid";

export default async function Home() {
  const categories = await getAllCategories();

  // Мок-данные для "Хитов продаж"
  const hitProducts = [
    {
      id: "prod1",
      slug: "product-one",
      name: "Название товара 1",
      description: "Краткое описание товара 1, очень интересный товар.",
      price: 1200.0,
      imageUrl: "/file.svg", // Заглушка изображения
    },
    {
      id: "prod2",
      slug: "product-two",
      name: "Название товара 2",
      description: "Краткое описание товара 2, который всем понравится.",
      price: 850.5,
      discount: 50.0,
      imageUrl: "/file.svg", // Заглушка изображения
    },
    {
      id: "prod3",
      slug: "product-three",
      name: "Название товара 3",
      description: "Краткое описание товара 3, новый хит сезона.",
      price: 2100.0,
      imageUrl: "/file.svg", // Заглушка изображения
    },
    {
      id: "prod4",
      slug: "product-four",
      name: "Название товара 4",
      description: "Краткое описание товара 4, не пропустите.",
      price: 599.99,
      imageUrl: "/file.svg", // Заглушка изображения
    },
  ];

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Добро пожаловать в Garden Store!
      </h1>

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
        <CatalogGrid>
          {hitProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </CatalogGrid>
      </section>
      {/* <AuthButtons /> */}
    </main>
  );
}
