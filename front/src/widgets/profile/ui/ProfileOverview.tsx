import { formatPrice } from "@/shared";
import { OrderInDB } from "@/shared/api/generated";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { BarChart3, Calendar, Mail, User } from "lucide-react";

interface ProfileOverviewProps {
  user: {
    fullName?: string | null;
    email?: string;
    id?: string;
    isAdmin?: boolean;
  };
  orders?: OrderInDB[];
  _isOrdersLoading?: boolean;
  _ordersError?: unknown;
}

export function ProfileOverview({
  user,
  orders,
  _isOrdersLoading,
  _ordersError,
}: ProfileOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Информация о пользователе */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Личная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            {user.fullName && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Имя</p>
                  <p className="font-medium">{user.fullName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Badge
                variant={user.isAdmin ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {user.isAdmin ? "Администратор" : "Пользователь"}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Статус аккаунта</p>
                <p className="font-medium">Активный</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Быстрая статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Быстрая статистика
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Всего заказов</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders?.length
                ? formatPrice(
                    (orders as OrderInDB[]).reduce(
                      (sum: number, order: OrderInDB) =>
                        sum + parseFloat(order.totalAmount),
                      0
                    )
                  )
                : formatPrice(0)}
            </div>
            <p className="text-sm text-muted-foreground">Потрачено</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(orders as OrderInDB[])?.filter(
                (order: OrderInDB) => order.status === "delivered"
              ).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Доставлено</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
