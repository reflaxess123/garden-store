"use client";

import { getStatusColor, getStatusIcon } from "@/entities/order";
import { OrderInDB } from "@/shared/api/generated";
import { formatDate } from "@/shared/lib/date-utils";
import { formatCurrency } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Calendar, Package, Trash2 } from "lucide-react";

interface OrderCardProps {
  order: OrderInDB;
  onDelete?: (orderId: string) => void;
  isDeleting?: boolean;
}

export function OrderCard({ order, onDelete, isDeleting }: OrderCardProps) {
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">
              Заказ #{order.id.slice(-8)}
            </CardTitle>
          </div>
          <Badge variant="secondary" className={`${statusColor} text-white`}>
            {statusIcon}
            <span className="ml-2">{order.status}</span>
          </Badge>
        </div>
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(order.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Сумма заказа
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Дата создания
            </p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Получатель
            </p>
            <p className="text-sm">{order.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
          </div>
        </div>

        {order.address && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Адрес доставки
            </p>
            <p className="text-sm">{order.address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
