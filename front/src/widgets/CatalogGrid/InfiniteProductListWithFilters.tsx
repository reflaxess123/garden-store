"use client";

import { Product } from "@/entities/product/api";
import { getProductsClient } from "@/entities/product/apiClient";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ProductInDB } from "@/shared/api/generated/types";
import { LoadMoreTrigger } from "@/shared/ui/LoadMoreTrigger";
import { CatalogGrid } from "@/widgets/CatalogGrid";
import { useInfiniteQuery } from "@tanstack/react-query";

// Функция для преобразования ProductInDB в Product
const convertToProduct = (productInDB: ProductInDB): Product => {
  return {
    id: productInDB.id,
    slug: productInDB.slug,
    name: productInDB.name,
    description: productInDB.description || "",
    price: productInDB.price,
    discount: productInDB.discount || null,
    characteristics: productInDB.characteristics || null,
    imageUrl: productInDB.imageUrl || null,
    categoryId: productInDB.categoryId,
    category: productInDB.category,
    createdAt: productInDB.createdAt,
    updatedAt: productInDB.updatedAt || "",
    timesOrdered: productInDB.timesOrdered,
  };
};

interface InfiniteProductListWithFiltersProps {
  initialProducts?: ProductInDB[];
  categorySlug: string;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryFilter?: string;
  inStock?: boolean;
  hasDiscount?: boolean;
}

export function InfiniteProductListWithFilters({
  initialProducts,
  categorySlug,
  searchQuery,
  sortBy,
  sortOrder,
  minPrice,
  maxPrice,
  categoryFilter,
  inStock,
  hasDiscount,
}: InfiniteProductListWithFiltersProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      "products",
      categorySlug,
      searchQuery,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      categoryFilter,
      inStock,
      hasDiscount,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const options: any = {
        offset: pageParam,
        limit: 20,
      };

      if (searchQuery) options.searchQuery = searchQuery;
      if (sortBy && sortBy !== "default") options.sortBy = sortBy;
      if (sortOrder) options.sortOrder = sortOrder;
      if (minPrice !== undefined) options.minPrice = minPrice;
      if (maxPrice !== undefined) options.maxPrice = maxPrice;
      if (categoryFilter && categoryFilter !== "all")
        options.categoryFilter = categoryFilter;
      if (inStock) options.inStock = inStock;
      if (hasDiscount) options.hasDiscount = hasDiscount;

      const products = await getProductsClient(categorySlug, options);
      return products;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0 || lastPage.length < 20) return undefined;
      return allPages.flat().length;
    },
    staleTime: 1000 * 60 * 2, // 2 минуты для фильтрованных результатов
    refetchOnWindowFocus: false, // Отключаем рефетч при фокусе
  });

  const products = data?.pages.flat() || [];

  const uniqueProducts = Array.from(
    new Set(products.map((product) => product.id))
  )
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as ProductInDB[];

  if (status === "error") return <div>Ошибка загрузки товаров.</div>;

  // Показываем индикатор загрузки при первом запросе
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {products.length === 0 && searchQuery ? (
        <p className="text-center text-gray-500">
          По запросу &quot;{searchQuery}&quot; товары не найдены.
        </p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">Товары не найдены.</p>
      ) : (
        <CatalogGrid>
          {uniqueProducts.map((product) => (
            <ProductCard key={product.id} product={convertToProduct(product)} />
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
          {isFetchingNextPage && (
            <p className="text-center text-muted-foreground mt-2">
              Загрузка больше товаров...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
