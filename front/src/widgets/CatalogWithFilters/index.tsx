"use client";

import { ProductInDB } from "@/shared/api/generated/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { InfiniteProductListWithFilters } from "@/widgets/CatalogGrid/InfiniteProductListWithFilters";
import { FilterX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CatalogWithFiltersProps {
  initialProducts: ProductInDB[];
  categorySlug: string;
  searchQuery?: string;
  currentCategory?: Category | null;
  allCategories: Category[];
  initialFilters: {
    sortBy?: "createdAt" | "price" | "name";
    sortOrder?: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
    categoryFilter?: string;
  };
}

export function CatalogWithFilters({
  initialProducts,
  categorySlug,
  searchQuery,
  currentCategory,
  allCategories,
  initialFilters,
}: CatalogWithFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy || "");
  const [sortOrder, setSortOrder] = useState<string>(
    initialFilters.sortOrder || "asc"
  );
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters.minPrice?.toString() || ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters.maxPrice?.toString() || ""
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialFilters.categoryFilter || ""
  );

  // Функция для обновления URL с параметрами
  const updateURL = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const newURL = `/catalog/${categorySlug}?${params.toString()}`;
    router.push(newURL);
  };

  // Обработчики изменения фильтров
  const handleSortChange = (newSortBy: string) => {
    const actualSortBy = newSortBy === "default" ? "" : newSortBy;
    setSortBy(actualSortBy);
    updateURL({
      sortBy: actualSortBy || undefined,
      sortOrder,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      categoryFilter: categoryFilter || undefined,
      q: searchQuery || undefined,
    });
  };

  const handleSortOrderChange = (newSortOrder: string) => {
    setSortOrder(newSortOrder);
    updateURL({
      sortBy,
      sortOrder: newSortOrder,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      categoryFilter: categoryFilter || undefined,
      q: searchQuery || undefined,
    });
  };

  const handlePriceFilter = () => {
    updateURL({
      sortBy,
      sortOrder,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      categoryFilter: categoryFilter || undefined,
      q: searchQuery || undefined,
    });
  };

  const handleCategoryFilter = (newCategoryFilter: string) => {
    const actualCategoryFilter =
      newCategoryFilter === "all" ? "" : newCategoryFilter;
    setCategoryFilter(actualCategoryFilter);
    updateURL({
      sortBy,
      sortOrder,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      categoryFilter: actualCategoryFilter || undefined,
      q: searchQuery || undefined,
    });
  };

  const clearFilters = () => {
    setSortBy("");
    setSortOrder("asc");
    setMinPrice("");
    setMaxPrice("");
    setCategoryFilter("");

    router.push(
      `/catalog/${categorySlug}${searchQuery ? `?q=${searchQuery}` : ""}`
    );
  };

  const hasActiveFilters = sortBy || minPrice || maxPrice || categoryFilter;

  return (
    <div>
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center">
        {currentCategory?.name || "Все товары"}
      </h1>

      {searchQuery && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Результаты поиска для:{" "}
            <span className="font-semibold">&quot;{searchQuery}&quot;</span>
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Боковая панель с фильтрами */}
        <aside className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Фильтры
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    <FilterX className="h-4 w-4 mr-1" />
                    Сбросить
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Сортировка */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Сортировка</Label>
                <Select
                  value={sortBy || "default"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сортировку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">По умолчанию</SelectItem>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="price">По цене</SelectItem>
                    <SelectItem value="createdAt">
                      По дате добавления
                    </SelectItem>
                  </SelectContent>
                </Select>

                {sortBy && (
                  <Select
                    value={sortOrder}
                    onValueChange={handleSortOrderChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">По возрастанию</SelectItem>
                      <SelectItem value="desc">По убыванию</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Фильтр по цене */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Цена</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="От"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={handlePriceFilter}
                    onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={handlePriceFilter}
                    onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
                  />
                </div>
              </div>

              {/* Фильтр по категории (только для страницы "all") */}
              {categorySlug === "all" && allCategories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Категория</Label>
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={handleCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Основной контент с инфинити скроллом */}
        <main className="flex-1">
          <InfiniteProductListWithFilters
            initialProducts={initialProducts}
            categorySlug={categorySlug}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            minPrice={minPrice ? parseFloat(minPrice) : undefined}
            maxPrice={maxPrice ? parseFloat(maxPrice) : undefined}
            categoryFilter={categoryFilter}
          />
        </main>
      </div>
    </div>
  );
}
