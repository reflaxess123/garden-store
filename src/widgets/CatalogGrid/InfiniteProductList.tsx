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
}

export function InfiniteProductList({
  initialProducts,
  categorySlug,
}: InfiniteProductListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["products", categorySlug],
      queryFn: async ({ pageParam = 0 }) => {
        const products = await getProductsClient(categorySlug, {
          offset: pageParam,
          limit: 20,
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

  if (status === "error") return <div>Ошибка загрузки товаров.</div>;

  return (
    <div>
      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          Товары в этой категории не найдены.
        </p>
      ) : (
        <CatalogGrid>
          {products.map((product) => (
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
