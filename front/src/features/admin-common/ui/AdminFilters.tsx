"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Filter, X } from "lucide-react";
import { ReactNode } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface AdminFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder: string;
    label?: string;
  }[];
  onClearFilters: () => void;
  children?: ReactNode; // Дополнительные фильтры
}

export default function AdminFilters({
  searchQuery,
  onSearchChange,
  filters = [],
  onClearFilters,
  children,
}: AdminFiltersProps) {
  const hasActiveFilters =
    searchQuery || filters.some((filter) => filter.value);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Поиск */}
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Фильтры */}
        {filters.map((filter, index) => (
          <div key={index} className="min-w-[150px]">
            {filter.label && (
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {filter.label}
              </label>
            )}
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Дополнительные фильтры */}
        {children}
      </div>

      {/* Кнопка очистки */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Очистить
        </Button>
      )}
    </div>
  );
}
