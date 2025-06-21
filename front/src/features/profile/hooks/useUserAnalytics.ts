import { UserAnalytics } from "@/entities/user";
import { OrderInDB } from "@/shared/api/generated";
import { useMemo } from "react";

export function useUserAnalytics(
  orders: OrderInDB[] | undefined
): UserAnalytics | null {
  // Извлекаем данные из заказов
  const analyticsData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return null;
    }

    const totalSpent = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount || "0");
    }, 0);

    const currentDate = new Date();
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    const recentOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thirtyDaysAgo;
    });

    // Расчет среднего времени между заказами
    const orderDates = orders
      .map((order) => new Date(order.createdAt))
      .sort((a, b) => a.getTime() - b.getTime());

    let averageTimeBetweenOrders = 0;
    if (orderDates.length > 1) {
      const intervals = [];
      for (let i = 1; i < orderDates.length; i++) {
        intervals.push(orderDates[i].getTime() - orderDates[i - 1].getTime());
      }
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
      averageTimeBetweenOrders = avgInterval / (1000 * 60 * 60 * 24); // в днях
    }

    const totalOrders = orders.length;
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
        order.orderItems?.forEach(
          (item: { name: string; quantity: number; priceSnapshot: string }) => {
            if (!acc[item.name]) {
              acc[item.name] = { count: 0, spent: 0 };
            }
            acc[item.name].count += item.quantity;
            acc[item.name].spent +=
              parseFloat(item.priceSnapshot) * item.quantity;
          }
        );
        return acc;
      },
      {}
    );

    const topProducts = Object.entries(productStats)
      .sort(
        ([, a], [, b]) =>
          (b as { count: number; spent: number }).spent -
          (a as { count: number; spent: number }).spent
      )
      .slice(0, 5) as Array<[string, { count: number; spent: number }]>;

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      statusStats,
      monthlyStats,
      topProducts,
      recentOrders,
      averageTimeBetweenOrders,
    };
  }, [orders]);

  return analyticsData
    ? {
        totalOrders: analyticsData.totalOrders,
        totalSpent: analyticsData.totalSpent,
        avgOrderValue: analyticsData.avgOrderValue,
        statusStats: analyticsData.statusStats,
        monthlyStats: analyticsData.monthlyStats,
        topProducts: analyticsData.topProducts,
      }
    : null;
}
