"use client";

import { OrderStats } from "@/entities/order/types";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Clock, DollarSign, Package, TrendingUp } from "lucide-react";

interface OrdersStatsProps {
  stats: OrderStats;
  isLoading?: boolean;
}

export function OrdersStats({ stats, isLoading }: OrdersStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Всего заказов",
      value: formatNumber(stats.totalOrders),
      description: "Общее количество заказов",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Потрачено",
      value: formatCurrency(stats.totalSpent),
      description: "Общая сумма заказов",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Средний чек",
      value: formatCurrency(stats.averageOrderValue),
      description: "Средняя стоимость заказа",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "В обработке",
      value: formatNumber(stats.statusCounts.processing || 0),
      description: "Заказы в обработке",
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
