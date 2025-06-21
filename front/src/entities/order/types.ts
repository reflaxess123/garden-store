/**
 * Типы для заказов
 */

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  statusCounts: Record<string, number>;
}

export interface OrderFilters {
  status: string;
  search: string;
  sortBy: "createdAt" | "totalAmount" | "status";
  sortOrder: "asc" | "desc";
}

export interface OrderStatusInfo {
  label: string;
  color: string;
  icon: React.ReactNode;
}
