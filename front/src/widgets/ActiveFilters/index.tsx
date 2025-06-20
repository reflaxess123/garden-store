"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ActiveFiltersProps {
  filters: {
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    inStock?: boolean;
    hasDiscount?: boolean;
  };
  allCategories: Category[];
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  allCategories,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters = [];

  // Поисковый запрос
  if (filters.searchQuery) {
    activeFilters.push({
      type: "search",
      label: `Поиск: "${filters.searchQuery}"`,
      value: filters.searchQuery,
    });
  }

  // Сортировка
  if (filters.sortBy && filters.sortBy !== "default") {
    const sortLabels = {
      name: "название",
      price: "цена",
      createdAt: "дата добавления",
    };
    const orderLabels = {
      asc: "по возрастанию",
      desc: "по убыванию",
    };

    activeFilters.push({
      type: "sort",
      label: `Сортировка: ${
        sortLabels[filters.sortBy as keyof typeof sortLabels]
      } ${orderLabels[filters.sortOrder as keyof typeof orderLabels] || ""}`,
      value: filters.sortBy,
    });
  }

  // Фильтр по цене
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = "Цена: ";
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel += `${filters.minPrice} - ${filters.maxPrice} руб.`;
    } else if (filters.minPrice !== undefined) {
      priceLabel += `от ${filters.minPrice} руб.`;
    } else if (filters.maxPrice !== undefined) {
      priceLabel += `до ${filters.maxPrice} руб.`;
    }

    activeFilters.push({
      type: "price",
      label: priceLabel,
      value: "price",
    });
  }

  // Категории
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach((categoryId) => {
      const category = allCategories.find((cat) => cat.id === categoryId);
      if (category) {
        activeFilters.push({
          type: "category",
          label: `Категория: ${category.name}`,
          value: categoryId,
        });
      }
    });
  }

  // В наличии
  if (filters.inStock) {
    activeFilters.push({
      type: "inStock",
      label: "В наличии",
      value: "inStock",
    });
  }

  // Со скидкой
  if (filters.hasDiscount) {
    activeFilters.push({
      type: "hasDiscount",
      label: "Со скидкой",
      value: "hasDiscount",
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          Активные фильтры:
        </span>
        {activeFilters.map((filter, index) => (
          <Badge
            key={`${filter.type}-${filter.value}-${index}`}
            variant="secondary"
            className="flex items-center gap-1 pl-3 pr-1"
          >
            <span>{filter.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onRemoveFilter(filter.type, filter.value)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {activeFilters.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-xs"
        >
          Сбросить все фильтры
        </Button>
      )}
    </div>
  );
}
