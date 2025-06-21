"use client";

import { Product } from "@/entities/product/api";
import { getProductsClient } from "@/entities/product/apiClient";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ProductInDB } from "@/shared/api/generated";
import { LoadMoreTrigger } from "@/shared/ui/LoadMoreTrigger";
import { CatalogGrid } from "@/widgets/CatalogGrid";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

// Функция для трансформации ProductInDB в Product
const transformProductInDBToProduct = (productInDB: ProductInDB): Product => ({
  id: productInDB.id,
  slug: productInDB.slug,
  name: productInDB.name,
  description: productInDB.description ?? null, // Преобразуем undefined в null
  price: productInDB.price,
  discount: productInDB.discount ?? null,
  characteristics: productInDB.characteristics ?? null,
  imageUrl: productInDB.imageUrl ?? null,
  categoryId: productInDB.categoryId,
  category: productInDB.category
    ? {
        id: productInDB.category.id || "",
        name: productInDB.category.name || "",
        slug: productInDB.category.slug || "",
      }
    : undefined,
  timesOrdered: productInDB.timesOrdered,
  createdAt: productInDB.createdAt,
  updatedAt: productInDB.updatedAt ?? productInDB.createdAt, // Используем createdAt как fallback для updatedAt
});

interface InfiniteProductListProps {
  initialProducts: Product[];
  categorySlug: string;
  searchQuery?: string;
}

export function InfiniteProductList({
  initialProducts,
  categorySlug,
  searchQuery,
}: InfiniteProductListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<
      Product[],
      Error,
      InfiniteData<Product[]>,
      [string, string, string?],
      number
    >({
      queryKey: ["products", categorySlug, searchQuery],
      queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
        const productsInDB = await getProductsClient(categorySlug, {
          offset: pageParam,
          limit: 20,
          searchQuery: searchQuery || undefined,
        });
        // Трансформируем ProductInDB[] в Product[]
        return productsInDB.map(transformProductInDBToProduct);
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) return undefined;
        return allPages.flat().length;
      },
      initialData: {
        pages: [initialProducts],
        pageParams: [0],
      },
      staleTime: 1000 * 60 * 5, // 5 минут
    });

  const products = data?.pages.flat() || [];

  const uniqueProducts = Array.from(
    new Set(products.map((product) => product.id))
  )
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as Product[];

  if (status === "error") return <div>Ошибка загрузки товаров.</div>;

  return (
    <div>
      {products.length === 0 && searchQuery ? (
        <p className="text-center text-gray-500">
          По запросу &quot;{searchQuery}&quot; товары не найдены.
        </p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          Товары в этой категории не найдены.
        </p>
      ) : (
        <CatalogGrid>
          {uniqueProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </CatalogGrid>
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <LoadMoreTrigger
            onLoadMore={() => fetchNextPage()}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
          />
          {isFetchingNextPage && <p>Загрузка больше товаров...</p>}
        </div>
      )}
    </div>
  );
}
