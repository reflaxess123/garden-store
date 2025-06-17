import { getProductBySlug } from "@/entities/product/api";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { "product-slug": string };
}) {
  const productSlug = params["product-slug"];
  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Breadcrumbs
        items={[
          { label: "Каталог", href: "/catalog" },
          {
            label: product.category.name,
            href: `/catalog/${product.category.slug}`,
          },
          { label: product.name, href: `/product/${product.slug}` },
        ]}
      />
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <div className="md:w-1/2">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />
          )}
        </div>
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>
          <p className="text-3xl font-semibold text-primary mb-6">
            {product.price} ₽
          </p>
          {/* Здесь можно добавить кнопки для добавления в корзину/избранное */}
          <h3 className="text-2xl font-semibold mb-4">Характеристики:</h3>
          {product.characteristics && (
            <ul className="list-disc list-inside space-y-2">
              {Object.entries(product.characteristics).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
