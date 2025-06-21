// API
export { api, httpClient, HttpClientError } from "./api/httpClient";
export type { ApiError, ApiResponse } from "./api/httpClient";

// Config
export {
  API_ROUTES,
  CACHE,
  FILE_UPLOAD,
  NOTIFICATIONS,
  PAGINATION,
  SORTING,
  WEBSOCKET,
} from "./config/api";

// Hooks
export {
  useAsyncList,
  useAsyncOperation,
  useAsyncState,
  useOperationState,
} from "./hooks/useAsyncState";
export { useForm, validators } from "./hooks/useForm";
export {
  paginationUtils,
  usePageSize,
  usePagination,
} from "./hooks/usePagination";
export type {
  PageSizeOptions,
  PaginationActions,
  PaginationOptions,
  PaginationState,
} from "./hooks/usePagination";

// Lib
export { logger } from "./lib/logger";
export {
  createBreadcrumbs,
  createSafeLink,
  createUrl,
  getUrlParam,
  isActiveRoute,
  isExternalUrl,
  parseSearchParams,
  routes,
  updateUrlParams,
} from "./lib/navigation";
export type { Breadcrumb } from "./lib/navigation";
export {
  dismissAll,
  notifications,
  showError,
  showInfo,
  showLoading,
  showPromise,
  showSuccess,
  showWarning,
} from "./lib/notifications";
export { Storage, storage } from "./lib/storage";
export { cn, formatPrice, generateSlug } from "./lib/utils";

// Types
export type {
  AsyncState,
  BaseEntity,
  CartId,
  CategoryId,
  DeepPartial,
  FileUpload,
  FilterParams,
  FormField,
  FormState,
  ListParams,
  LoadingState,
  ModalState,
  Notification,
  NotificationAction,
  NotificationType,
  OperationState,
  OperationStatus,
  Optional,
  OrderId,
  PaginatedResponse,
  PaginationParams,
  ProductId,
  RequiredBy,
  SearchParams,
  SelectOption,
  SortParams,
  TableColumn,
  TableState,
  UserId,
} from "./types/common";

// UI Components
export {
  EmptyCart,
  EmptyOrders,
  EmptyProducts,
  EmptySearch,
  EmptyState,
  EmptyUsers,
} from "./ui/EmptyState";
export {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
} from "./ui/ErrorBoundary";
export {
  Loading,
  LoadingOverlay,
  LoadingPage,
  LoadingSpinner,
} from "./ui/Loading";
export {
  MobilePagination,
  Pagination,
  SimplePagination,
} from "./ui/Pagination";

// Переэкспорт часто используемых UI компонентов
export { Badge } from "./ui/badge";
export { Button } from "./ui/button";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
export { Checkbox } from "./ui/checkbox";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
export { Input } from "./ui/input";
export { Label } from "./ui/label";
export { Separator } from "./ui/separator";
export { Toaster } from "./ui/sonner";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
export { Textarea } from "./ui/textarea";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// Переэкспорт других полезных утилит
export { BadgeIcon } from "./ui/BadgeIcon";
export { LoadMoreTrigger } from "./ui/LoadMoreTrigger";
export { SearchInput } from "./ui/SearchInput";
export { ThemeToggle } from "./ui/ThemeToggle";
