import { formatPrice } from "@/shared";
import { OrderInDB } from "@/shared/api/generated";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Package, ShoppingBag } from "lucide-react";

interface RecentOrdersProps {
  orders: OrderInDB[] | undefined;
  isLoading: boolean;
  error: any;
}

export function RecentOrders({ orders, isLoading, error }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Последние заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Загрузка заказов...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Последние заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center">
            Не удалось загрузить заказы. Попробуйте обновить страницу.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!orders?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Последние заказы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">У вас еще нет заказов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Последние заказы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.slice(0, 3).map((order: OrderInDB) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div>
                <p className="font-medium">Заказ #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatPrice(parseFloat(order.totalAmount))}
                </p>
                <Badge variant="outline" className="text-xs">
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
