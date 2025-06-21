import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import type {
  PageSizeOptions,
  PaginationOptions,
} from "../hooks/usePagination";
import {
  paginationUtils,
  usePageSize,
  usePagination,
} from "../hooks/usePagination";
import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface PaginationProps extends PaginationOptions {
  className?: string;
  showPageSize?: boolean;
  showInfo?: boolean;
  pageSizeOptions?: PageSizeOptions;
  compact?: boolean;
}

export function Pagination({
  className,
  showPageSize = true,
  showInfo = true,
  pageSizeOptions,
  compact = false,
  ...paginationOptions
}: PaginationProps) {
  const pagination = usePagination(paginationOptions);
  const pageSize = usePageSize(pageSizeOptions);

  if (pagination.totalPages <= 1 && !showPageSize && !showInfo) {
    return null;
  }

  const paginationInfo = paginationUtils.getPaginationInfo(
    pagination.currentPage,
    pagination.totalItems,
    pagination.itemsPerPage
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        compact && "flex-col gap-4 sm:flex-row",
        className
      )}
    >
      {/* Информация о пагинации */}
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          {paginationInfo.text}
        </div>
      )}

      {/* Основная пагинация */}
      <div className="flex items-center gap-2">
        {/* Размер страницы */}
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Показать:</span>
            <Select
              value={String(pageSize.currentPageSize)}
              onValueChange={(value) => pageSize.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSize.availablePageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Кнопки пагинации */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Первая страница */}
            {!compact && (
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.goToFirstPage}
                disabled={pagination.isFirstPage}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Предыдущая страница */}
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.goToPrevPage}
              disabled={pagination.hasPrevPage === false}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Номера страниц */}
            {!compact &&
              pagination.visiblePages.map((page, index) => {
                const isCurrentPage = page === pagination.currentPage;
                const showEllipsis =
                  (index === 0 && page > 1) ||
                  (index === pagination.visiblePages.length - 1 &&
                    page < pagination.totalPages);

                return (
                  <div key={page} className="flex items-center">
                    {index === 0 && page > 1 && (
                      <div className="flex items-center justify-center h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    )}

                    <Button
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => pagination.goToPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>

                    {index === pagination.visiblePages.length - 1 &&
                      page < pagination.totalPages && (
                        <div className="flex items-center justify-center h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      )}
                  </div>
                );
              })}

            {/* Компактный режим - показываем только текущую страницу */}
            {compact && (
              <div className="flex items-center gap-2 px-2">
                <span className="text-sm">
                  {pagination.currentPage} из {pagination.totalPages}
                </span>
              </div>
            )}

            {/* Следующая страница */}
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.goToNextPage}
              disabled={pagination.hasNextPage === false}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Последняя страница */}
            {!compact && (
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.goToLastPage}
                disabled={pagination.isLastPage}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Простой компонент пагинации только с кнопками
 */
export function SimplePagination({
  className,
  ...props
}: Omit<PaginationProps, "showPageSize" | "showInfo">) {
  return (
    <Pagination
      {...props}
      className={className}
      showPageSize={false}
      showInfo={false}
      compact
    />
  );
}

/**
 * Компактный компонент пагинации для мобильных устройств
 */
export function MobilePagination({ className, ...props }: PaginationProps) {
  return <Pagination {...props} className={className} compact />;
}
