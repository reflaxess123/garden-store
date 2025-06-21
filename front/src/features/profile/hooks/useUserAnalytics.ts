import { UserAnalytics } from "@/entities/user";
import { OrderInDB } from "@/shared/api/generated";
import { useMemo } from "react";

export function useUserAnalytics(
  orders: OrderInDB[] | undefined
): UserAnalytics | null {
  return useMemo(() => {
    if (!orders?.length) return null;

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum: number, order: OrderInDB) => sum + parseFloat(order.totalAmount),
      0
    );
    const avgOrderValue = totalSpent / totalOrders;

    // Статистика по статусам
    const statusStats = orders.reduce(
      (acc: Record<string, number>, order: OrderInDB) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Статистика по месяцам
    const monthlyStats = orders.reduce(
      (
        acc: Record<string, { count: number; spent: number }>,
        order: OrderInDB
      ) => {
        const month = new Date(order.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
        });
        if (!acc[month]) {
          acc[month] = { count: 0, spent: 0 };
        }
        acc[month].count += 1;
        acc[month].spent += parseFloat(order.totalAmount);
        return acc;
      },
      {}
    );

    // Топ товары
    const productStats = orders.reduce(
      (
        acc: Record<string, { count: number; spent: number }>,
        order: OrderInDB
      ) => {
        order.orderItems?.forEach((item: any) => {
          if (!acc[item.name]) {
            acc[item.name] = { count: 0, spent: 0 };
          }
          acc[item.name].count += item.quantity;
          acc[item.name].spent +=
            parseFloat(item.priceSnapshot) * item.quantity;
        });
        return acc;
      },
      {}
    );

    const topProducts = Object.entries(productStats)
      .sort(([, a], [, b]) => (b as any).spent - (a as any).spent)
      .slice(0, 5) as Array<[string, { count: number; spent: number }]>;

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      statusStats,
      monthlyStats,
      topProducts,
    };
  }, [orders]);
}
