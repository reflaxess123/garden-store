import { OrderFilters } from "@/entities/order/types";
import { OrderInDB } from "@/shared/api/generated/model";
import { useMemo, useState } from "react";

/**
 * Хук для фильтрации и сортировки заказов
 */
export function useOrdersFilter(orders: OrderInDB[]) {
  const [filters, setFilters] = useState<OrderFilters>({
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Фильтр по статусу
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Поиск по ID заказа
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchLower) ||
          order.fullName?.toLowerCase().includes(searchLower) ||
          order.email?.toLowerCase().includes(searchLower)
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      if (filters.sortBy === "totalAmount") {
        aValue = a.totalAmount;
        bValue = b.totalAmount;
      } else if (filters.sortBy === "createdAt") {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else {
        aValue = a.status;
        bValue = b.status;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, filters]);

  const updateFilter = (key: keyof OrderFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return {
    filters,
    filteredOrders,
    updateFilter,
    clearFilters,
  };
}
