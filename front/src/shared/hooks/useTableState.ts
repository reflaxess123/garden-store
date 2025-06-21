"use client";

import { useMemo, useState } from "react";

export interface TableState {
  searchQuery: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  currentPage: number;
  itemsPerPage: number;
  filters: Record<string, any>;
}

export interface UseTableStateProps<T> {
  data: T[];
  initialState?: Partial<TableState>;
  searchFields?: (keyof T)[];
  sortFields?: Record<string, (a: T, b: T) => number>;
}

export function useTableState<T extends Record<string, any>>({
  data,
  initialState = {},
  searchFields = [],
  sortFields = {},
}: UseTableStateProps<T>) {
  const [state, setState] = useState<TableState>({
    searchQuery: "",
    sortBy: "",
    sortOrder: "asc",
    currentPage: 1,
    itemsPerPage: 20,
    filters: {},
    ...initialState,
  });

  // Обновление состояния
  const updateState = (updates: Partial<TableState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const setSearchQuery = (searchQuery: string) => {
    updateState({ searchQuery, currentPage: 1 });
  };

  const setSorting = (sortBy: string, sortOrder?: "asc" | "desc") => {
    updateState({
      sortBy,
      sortOrder:
        sortOrder ||
        (state.sortBy === sortBy && state.sortOrder === "asc" ? "desc" : "asc"),
    });
  };

  const setCurrentPage = (currentPage: number) => {
    updateState({ currentPage });
  };

  const setItemsPerPage = (itemsPerPage: number) => {
    updateState({ itemsPerPage, currentPage: 1 });
  };

  const setFilter = (key: string, value: any) => {
    updateState({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    });
  };

  const clearFilters = () => {
    updateState({
      searchQuery: "",
      filters: {},
      currentPage: 1,
    });
  };

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Поиск по текстовым полям
    if (state.searchQuery && searchFields.length > 0) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Применение дополнительных фильтров
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];
          if (typeof value === "string" && value.includes(",")) {
            // Множественный выбор
            return value.split(",").includes(String(itemValue));
          }
          return String(itemValue)
            .toLowerCase()
            .includes(String(value).toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, state.searchQuery, state.filters, searchFields]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!state.sortBy) return filteredData;

    const sorted = [...filteredData];

    if (sortFields[state.sortBy]) {
      // Кастомная функция сортировки
      sorted.sort(sortFields[state.sortBy]);
    } else {
      // Стандартная сортировка
      sorted.sort((a, b) => {
        const aVal = a[state.sortBy];
        const bVal = b[state.sortBy];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal;
        }

        return String(aVal).localeCompare(String(bVal));
      });
    }

    return state.sortOrder === "desc" ? sorted.reverse() : sorted;
  }, [filteredData, state.sortBy, state.sortOrder, sortFields]);

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / state.itemsPerPage);
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + state.itemsPerPage
  );

  return {
    // Состояние
    ...state,

    // Данные
    filteredData,
    sortedData,
    paginatedData,
    totalItems: sortedData.length,
    totalPages,

    // Методы обновления
    setSearchQuery,
    setSorting,
    setCurrentPage,
    setItemsPerPage,
    setFilter,
    clearFilters,
    updateState,
  };
}
