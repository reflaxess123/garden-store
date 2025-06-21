"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Search, X } from "lucide-react";
import { ReactNode } from "react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
}

export interface FilterPanelProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onClearFilters?: () => void;
  children?: ReactNode;
  className?: string;
}

export default function FilterPanel({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Поиск...",
  filters = [],
  onClearFilters,
  children,
  className = "",
}: FilterPanelProps) {
  const hasActiveFilters =
    searchQuery || filters.some((filter) => filter.value);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Поиск */}
          {onSearchChange && (
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Фильтры */}
          <div className="flex gap-4 flex-wrap">
            {filters.map((filter) => (
              <div key={filter.key} className="min-w-48">
                {filter.type === "select" && filter.options ? (
                  <select
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange?.(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">
                      {filter.placeholder || filter.label}
                    </option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === "date" ? (
                  <Input
                    type="date"
                    placeholder={filter.placeholder}
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange?.(e.target.value)}
                  />
                ) : filter.type === "number" ? (
                  <Input
                    type="number"
                    placeholder={filter.placeholder}
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange?.(Number(e.target.value))}
                  />
                ) : (
                  <Input
                    placeholder={filter.placeholder}
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange?.(e.target.value)}
                  />
                )}
              </div>
            ))}

            {/* Дополнительные элементы управления */}
            {children}

            {/* Кнопка сброса фильтров */}
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Сбросить
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
