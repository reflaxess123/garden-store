import { useUserAnalytics } from "@/features/profile/hooks";
import { formatPrice } from "@/shared";
import { OrderInDB } from "@/shared/api/generated";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { BarChart3, Package, Star } from "lucide-react";

interface ProfileAnalyticsProps {
  orders: OrderInDB[];
  isLoading: boolean;
}

const statusLabels = {
  pending: "В ожидании",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

export function ProfileAnalytics({ orders, isLoading }: ProfileAnalyticsProps) {
  const analyticsData = useUserAnalytics(orders);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Загрузка аналитики...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Нет данных для анализа</p>
        <p className="text-sm">
          Сделайте первый заказ, чтобы увидеть статистику
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-700">
              {analyticsData.totalOrders}
            </div>
            <p className="text-sm text-blue-600 font-medium">Всего заказов</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-700">
              {formatPrice(analyticsData.totalSpent)}
            </div>
            <p className="text-sm text-green-600 font-medium">
              Потрачено всего
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-700">
              {formatPrice(analyticsData.avgOrderValue)}
            </div>
            <p className="text-sm text-purple-600 font-medium">Средний чек</p>
          </CardContent>
        </Card>
      </div>

      {/* График по статусам */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Заказы по статусам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analyticsData.statusStats).map(
              ([status, count]) => {
                const maxCount = Math.max(
                  ...Object.values(analyticsData.statusStats)
                );
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-medium">
                      {statusLabels[status as keyof typeof statusLabels] ||
                        status}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className="bg-primary h-6 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2 shadow-sm"
                        style={{
                          width: `${Math.max((count / maxCount) * 100, 8)}%`,
                          minWidth: "30px",
                        }}
                      >
                        <span className="text-xs text-primary-foreground font-semibold">
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Топ товары */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Любимые товары
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topProducts.map(([product, stats], index) => (
              <div
                key={product}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{product}</p>
                    <p className="text-sm text-muted-foreground">
                      Куплено: {stats.count} шт.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatPrice(stats.spent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
