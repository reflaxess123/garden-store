"use client";

import { Product } from "@/entities/product/api";
import { getProductsClient } from "@/entities/product/apiClient";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { LoadMoreTrigger } from "@/shared/ui/LoadMoreTrigger";
import { CatalogGrid } from "@/widgets/CatalogGrid";
import { useInfiniteQuery } from "@tanstack/react-query";

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
    useInfiniteQuery({
      queryKey: ["products", categorySlug, searchQuery],
      queryFn: async ({ pageParam = 0 }) => {
        const products = await getProductsClient(categorySlug, {
          offset: pageParam,
          limit: 20,
          searchQuery: searchQuery || undefined,
        });
        return products;
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
