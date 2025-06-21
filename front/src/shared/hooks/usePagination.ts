import { useMemo } from "react";
import { getUrlParam, updateUrlParams } from "../lib/navigation";

export interface PaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  currentPage?: number;
  maxVisiblePages?: number;
  onPageChange?: (page: number) => void;
  useUrlParams?: boolean;
  pageParamName?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  visiblePages: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export function usePagination(
  options: PaginationOptions
): PaginationState & PaginationActions {
  const {
    totalItems,
    itemsPerPage = 20,
    currentPage: controlledCurrentPage,
    maxVisiblePages = 5,
    onPageChange,
    useUrlParams = false,
    pageParamName = "page",
  } = options;

  // Получаем текущую страницу из URL или пропов
  const urlPage = useUrlParams
    ? parseInt(getUrlParam(pageParamName) || "1", 10)
    : 1;
  const currentPage = controlledCurrentPage || urlPage;

  const state = useMemo<PaginationState>(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const safePage = Math.max(1, Math.min(currentPage, totalPages));

    const hasNextPage = safePage < totalPages;
    const hasPrevPage = safePage > 1;
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

    // Вычисляем видимые страницы
    const visiblePages: number[] = [];
    if (totalPages <= maxVisiblePages) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Показываем ограниченное количество страниц
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, safePage - halfVisible);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Корректируем если не хватает страниц в начале
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }
    }

    return {
      currentPage: safePage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex,
      visiblePages,
      isFirstPage: safePage === 1,
      isLastPage: safePage === totalPages,
    };
  }, [currentPage, totalItems, itemsPerPage, maxVisiblePages]);

  const actions = useMemo<PaginationActions>(() => {
    const goToPage = (page: number) => {
      const safePage = Math.max(1, Math.min(page, state.totalPages));

      if (useUrlParams) {
        updateUrlParams({ [pageParamName]: safePage === 1 ? null : safePage });
      }

      onPageChange?.(safePage);
    };

    return {
      goToPage,
      goToNextPage: () => goToPage(state.currentPage + 1),
      goToPrevPage: () => goToPage(state.currentPage - 1),
      goToFirstPage: () => goToPage(1),
      goToLastPage: () => goToPage(state.totalPages),
    };
  }, [
    state.currentPage,
    state.totalPages,
    onPageChange,
    useUrlParams,
    pageParamName,
  ]);

  return { ...state, ...actions };
}

/**
 * Хук для работы с размером страницы
 */
export interface PageSizeOptions {
  currentPageSize?: number;
  availablePageSizes?: number[];
  onPageSizeChange?: (size: number) => void;
  useUrlParams?: boolean;
  pageSizeParamName?: string;
}

export function usePageSize(options: PageSizeOptions = {}) {
  const {
    currentPageSize: controlledPageSize,
    availablePageSizes = [10, 20, 50, 100],
    onPageSizeChange,
    useUrlParams = false,
    pageSizeParamName = "pageSize",
  } = options;

  const urlPageSize = useUrlParams
    ? parseInt(
        getUrlParam(pageSizeParamName) || String(availablePageSizes[0]),
        10
      )
    : availablePageSizes[0];

  const currentPageSize = controlledPageSize || urlPageSize;

  const setPageSize = (size: number) => {
    if (useUrlParams) {
      updateUrlParams({
        [pageSizeParamName]: size === availablePageSizes[0] ? null : size,
        page: null, // Reset to first page when changing page size
      });
    }

    onPageSizeChange?.(size);
  };

  return {
    currentPageSize,
    availablePageSizes,
    setPageSize,
  };
}

/**
 * Утилиты для пагинации
 */
export const paginationUtils = {
  /**
   * Получает элементы для текущей страницы
   */
  getPageItems: <T>(items: T[], page: number, pageSize: number): T[] => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  },

  /**
   * Создает информацию о пагинации для отображения
   */
  getPaginationInfo: (
    currentPage: number,
    totalItems: number,
    itemsPerPage: number
  ) => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      start: startIndex,
      end: endIndex,
      total: totalItems,
      text: `${startIndex}-${endIndex} из ${totalItems}`,
    };
  },

  /**
   * Проверяет, нужна ли пагинация
   */
  needsPagination: (totalItems: number, itemsPerPage: number): boolean => {
    return totalItems > itemsPerPage;
  },
};
