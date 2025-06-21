"use client";

import { OrderFilters } from "@/entities/order/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Search, X } from "lucide-react";

interface OrdersFiltersProps {
  filters: OrderFilters;
  onUpdateFilter: (key: keyof OrderFilters, value: string) => void;
  onClearFilters: () => void;
}

export function OrdersFilters({
  filters,
  onUpdateFilter,
  onClearFilters,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Фильтры</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Очистить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по ID или имени..."
            value={filters.search}
            onChange={(e) => onUpdateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Статус */}
        <Select
          value={filters.status}
          onValueChange={(value) => onUpdateFilter("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все статусы</SelectItem>
            <SelectItem value="pending">В ожидании</SelectItem>
            <SelectItem value="processing">В обработке</SelectItem>
            <SelectItem value="shipped">Отправлен</SelectItem>
            <SelectItem value="delivered">Доставлен</SelectItem>
            <SelectItem value="cancelled">Отменен</SelectItem>
          </SelectContent>
        </Select>

        {/* Сортировка */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onUpdateFilter("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Сортировать по" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">По дате</SelectItem>
            <SelectItem value="totalAmount">По сумме</SelectItem>
            <SelectItem value="status">По статусу</SelectItem>
          </SelectContent>
        </Select>

        {/* Порядок сортировки */}
        <Select
          value={filters.sortOrder}
          onValueChange={(value) => onUpdateFilter("sortOrder", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Порядок" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">По убыванию</SelectItem>
            <SelectItem value="asc">По возрастанию</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
