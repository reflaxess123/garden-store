"use client";

import { useMemo, useState } from "react";

export interface PaginatedListConfig {
  itemsPerPage?: number;
  searchFields?: string[]; // Поля для поиска
}

export function usePaginatedList<T extends Record<string, any>>(
  data: T[] = [],
  config: PaginatedListConfig = {}
) {
  const { itemsPerPage: defaultItemsPerPage = 10, searchFields = [] } = config;

  // Состояние
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Поиск по тексту
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(query);
        })
      );
    }

    // Применение фильтров
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];
          return itemValue === value || itemValue?.toString() === value;
        });
      }
    });

    return filtered;
  }, [data, searchQuery, filters, searchFields]);

  // Пагинация
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Функции управления
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Сбрасываем на первую страницу
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Сбрасываем на первую страницу
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Сбрасываем на первую страницу
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
    setCurrentPage(1);
  };

  // Коррекция текущей страницы если она стала недействительной
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  if (adjustedCurrentPage !== currentPage) {
    setCurrentPage(adjustedCurrentPage);
  }

  return {
    // Данные
    data: paginatedData,
    filteredData,
    totalItems: filteredData.length,

    // Состояние пагинации
    currentPage: adjustedCurrentPage,
    totalPages,
    itemsPerPage,

    // Состояние фильтрации
    searchQuery,
    filters,

    // Функции управления
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,

    // Проверки
    hasFilters: searchQuery || Object.values(filters).some(Boolean),
    isEmpty: filteredData.length === 0,
    isFirstPage: adjustedCurrentPage === 1,
    isLastPage: adjustedCurrentPage === totalPages,
  };
}
