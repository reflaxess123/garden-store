// Базовые типы
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Пагинация
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Сортировка
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Поиск
export interface SearchParams {
  searchQuery?: string;
}

// Фильтрация
export interface FilterParams {
  [key: string]: any;
}

// Объединенные параметры для запросов списков
export interface ListParams
  extends PaginationParams,
    SortParams,
    SearchParams,
    FilterParams {}

// Статусы загрузки
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Статусы операций
export enum OperationStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface OperationState {
  status: OperationStatus;
  error?: string;
  message?: string;
}

// Общие типы форм
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Модальные окна
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// Уведомления
export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary";
}

// Файлы
export interface FileUpload {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
  url?: string;
}

// Селекторы
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Таблицы
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableState {
  selectedRows: string[];
  pagination: PaginationParams;
  sorting: SortParams;
  filters: FilterParams;
}

// Общие утилиты типов
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ID типы для строгой типизации
export type ProductId = string & { readonly brand: unique symbol };
export type CategoryId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };
export type OrderId = string & { readonly brand: unique symbol };
export type CartId = string & { readonly brand: unique symbol };
