// Общие переиспользуемые компоненты для админ панели
export { default as ActionButtons } from "./ActionButtons";
export { default as ConfirmDialog } from "./ConfirmDialog";
export { default as DataTable } from "./DataTable";
export { default as FilterPanel } from "./FilterPanel";
export { default as FormModal } from "./FormModal";
export { default as Pagination } from "./Pagination";
export { default as SearchInput } from "./SearchInput";
export { default as StatsCards } from "./StatsCards";
export { default as StatusBadge } from "./StatusBadge";
export { default as ViewModeToggle } from "./ViewModeToggle";

// Новые универсальные компоненты
export { default as AdminFilters } from "./AdminFilters";
export { default as AdminPageHeader } from "./AdminPageHeader";
export { default as AdminPagination } from "./AdminPagination";
export { default as CrudFormModal } from "./CrudFormModal";
export { default as DeleteConfirmDialog } from "./DeleteConfirmDialog";
export { default as StatsGrid } from "./StatsGrid";

// Экспорт типов
export type { AdminFiltersProps, FilterOption } from "./AdminFilters";
export type { AdminPaginationProps } from "./AdminPagination";
export type { StatCard as StatsCard, StatsGridProps } from "./StatsGrid";

// Экспорт хуков (если они есть в shared)
export { useTableState } from "../../../shared/hooks/useTableState";

// Экспорт типов
export type { Action, ActionButtonsProps } from "./ActionButtons";
export type { Column, DataTableProps } from "./DataTable";
export type { FilterConfig, FilterPanelProps } from "./FilterPanel";
export type { PaginationProps } from "./Pagination";
export type { StatCard, StatsCardsProps } from "./StatsCards";
export type { StatusBadgeProps, StatusType } from "./StatusBadge";
export type { ViewMode, ViewModeToggleProps } from "./ViewModeToggle";
