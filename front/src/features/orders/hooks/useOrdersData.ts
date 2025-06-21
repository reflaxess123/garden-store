import { OrderStats } from "@/entities/order/types";
import {
  useDeleteOrderApiOrdersDelete,
  useGetUserOrdersApiOrdersGet,
} from "@/shared/api/generated/fastAPI";
import { useMemo } from "react";

/**
 * Хук для получения данных заказов пользователя
 */
export function useOrdersData() {
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useGetUserOrdersApiOrdersGet({
    query: {
      enabled: true,
    },
  });

  const stats: OrderStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount || "0"),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      statusCounts,
    };
  }, [orders]);

  return {
    orders,
    stats,
    isLoading,
    error,
    refetch,
  };
}

export function useDeleteOrder() {
  return useDeleteOrderApiOrdersDelete();
}
