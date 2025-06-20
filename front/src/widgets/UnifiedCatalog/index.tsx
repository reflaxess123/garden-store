"use client";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { ActiveFilters } from "@/widgets/ActiveFilters";
import { InfiniteProductListWithFilters } from "@/widgets/CatalogGrid/InfiniteProductListWithFilters";
import { Filter, FilterX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface UnifiedCatalogProps {
  allCategories: Category[];
  initialFilters: {
    searchQuery?: string;
    sortBy?: "createdAt" | "price" | "name";
    sortOrder?: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    inStock?: boolean;
    hasDiscount?: boolean;
  };
}

export function UnifiedCatalog({
  allCategories,
  initialFilters,
}: UnifiedCatalogProps) {
  const router = useRouter();

  // Состояния фильтров (searchQuery убираем из состояния)
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories || []
  );
  const [inStock, setInStock] = useState<boolean>(
    initialFilters.inStock || false
  );
  const [hasDiscount, setHasDiscount] = useState<boolean>(
    initialFilters.hasDiscount || false
  );

  // Функция для обновления URL с параметрами
  const updateURL = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });

    const newURL = `/catalog?${params.toString()}`;
    router.push(newURL);
  };

  // Функция для получения текущих параметров (без searchQuery)
  const getCurrentParams = () => ({
    q: initialFilters.searchQuery || undefined, // Используем значение из props, а не состояние
    sortBy: sortBy || undefined,
    sortOrder: sortOrder !== "asc" ? sortOrder : undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    categories:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
    inStock: inStock ? "true" : undefined,
    hasDiscount: hasDiscount ? "true" : undefined,
  });

  // Обработчики изменения фильтров
  const handleSortChange = (newSortBy: string) => {
    const actualSortBy = newSortBy === "default" ? "" : newSortBy;
    setSortBy(actualSortBy);
    updateURL({ ...getCurrentParams(), sortBy: actualSortBy || undefined });
  };

  const handleSortOrderChange = (newSortOrder: string) => {
    setSortOrder(newSortOrder);
    updateURL({
      ...getCurrentParams(),
      sortOrder: newSortOrder !== "asc" ? newSortOrder : undefined,
    });
  };

  const handlePriceFilter = () => {
    updateURL(getCurrentParams());
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    let newCategories;
    if (checked) {
      newCategories = [...selectedCategories, categoryId];
    } else {
      newCategories = selectedCategories.filter((id) => id !== categoryId);
    }
    setSelectedCategories(newCategories);
    updateURL({
      ...getCurrentParams(),
      categories:
        newCategories.length > 0 ? newCategories.join(",") : undefined,
    });
  };

  const handleInStockToggle = (checked: boolean) => {
    setInStock(checked);
    updateURL({ ...getCurrentParams(), inStock: checked ? "true" : undefined });
  };

  const handleDiscountToggle = (checked: boolean) => {
    setHasDiscount(checked);
    updateURL({
      ...getCurrentParams(),
      hasDiscount: checked ? "true" : undefined,
    });
  };

  // Обработчик удаления отдельного фильтра
  const handleRemoveFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case "sort":
        setSortBy("");
        setSortOrder("asc");
        updateURL({
          ...getCurrentParams(),
          sortBy: undefined,
          sortOrder: undefined,
        });
        break;
      case "price":
        setMinPrice("");
        setMaxPrice("");
        updateURL({
          ...getCurrentParams(),
          minPrice: undefined,
          maxPrice: undefined,
        });
        break;
      case "category":
        if (value) {
          const newCategories = selectedCategories.filter((id) => id !== value);
          setSelectedCategories(newCategories);
          updateURL({
            ...getCurrentParams(),
            categories:
              newCategories.length > 0 ? newCategories.join(",") : undefined,
          });
        }
        break;
      case "inStock":
        setInStock(false);
        updateURL({ ...getCurrentParams(), inStock: undefined });
        break;
      case "hasDiscount":
        setHasDiscount(false);
        updateURL({ ...getCurrentParams(), hasDiscount: undefined });
        break;
    }
  };

  const clearAllFilters = () => {
    setSortBy("");
    setSortOrder("asc");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategories([]);
    setInStock(false);
    setHasDiscount(false);

    // Сохраняем поисковый запрос, если он есть
    const params = new URLSearchParams();
    if (initialFilters.searchQuery) {
      params.set("q", initialFilters.searchQuery);
    }

    const newURL = params.toString()
      ? `/catalog?${params.toString()}`
      : "/catalog";
    router.push(newURL);
  };

  const hasActiveFilters =
    sortBy ||
    minPrice ||
    maxPrice ||
    selectedCategories.length > 0 ||
    inStock ||
    hasDiscount;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Каталог товаров</h1>

        {/* Кнопка фильтров для мобильных */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 px-4 sm:px-6">
            <SheetHeader className="px-0">
              <SheetTitle className="flex items-center justify-between text-left">
                Фильтры
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs shrink-0"
                  >
                    <FilterX className="h-4 w-4 mr-1" />
                    Сбросить
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6 pb-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Мобильные фильтры - тот же контент что и в sidebar */}
              {/* Сортировка */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  Сортировка
                </Label>
                <Select
                  value={sortBy || "default"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="h-11">
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
                    <SelectTrigger className="h-11">
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
                <Label className="text-sm font-semibold text-foreground">
                  Цена
                </Label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="От"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={handlePriceFilter}
                    onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
                    className="h-11"
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={handlePriceFilter}
                    onKeyDown={(e) => e.key === "Enter" && handlePriceFilter()}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Категории */}
              {allCategories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">
                    Категории
                  </Label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {allCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={`mobile-category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) =>
                            handleCategoryToggle(category.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-2 border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <label
                          htmlFor={`mobile-category-${category.id}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Дополнительные фильтры */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  Дополнительно
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      id="mobile-in-stock"
                      checked={inStock}
                      onChange={(e) => handleInStockToggle(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <label
                      htmlFor="mobile-in-stock"
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      В наличии
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      id="mobile-has-discount"
                      checked={hasDiscount}
                      onChange={(e) => handleDiscountToggle(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <label
                      htmlFor="mobile-has-discount"
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      Со скидкой
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Активные фильтры */}
      <ActiveFilters
        filters={{
          searchQuery: initialFilters.searchQuery || undefined,
          sortBy,
          sortOrder,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          categories: selectedCategories,
          inStock,
          hasDiscount,
        }}
        allCategories={allCategories}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={clearAllFilters}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Основной контент слева */}
        <main className="flex-1 lg:order-1">
          <InfiniteProductListWithFilters
            categorySlug="all"
            searchQuery={initialFilters.searchQuery || ""}
            sortBy={sortBy}
            sortOrder={sortOrder}
            minPrice={minPrice ? parseFloat(minPrice) : undefined}
            maxPrice={maxPrice ? parseFloat(maxPrice) : undefined}
            categoryFilter={
              selectedCategories.length > 0
                ? selectedCategories.join(",")
                : undefined
            }
            inStock={inStock}
            hasDiscount={hasDiscount}
          />
        </main>

        {/* Фильтры справа */}
        <aside className="lg:w-1/4 lg:order-2">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Фильтры
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
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

              {/* Категории */}
              {allCategories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Категории</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) =>
                            handleCategoryToggle(category.id, e.target.checked)
                          }
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Дополнительные фильтры */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Дополнительно</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={inStock}
                      onChange={(e) => handleInStockToggle(e.target.checked)}
                    />
                    <label
                      htmlFor="in-stock"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      В наличии
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has-discount"
                      checked={hasDiscount}
                      onChange={(e) => handleDiscountToggle(e.target.checked)}
                    />
                    <label
                      htmlFor="has-discount"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Со скидкой
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
