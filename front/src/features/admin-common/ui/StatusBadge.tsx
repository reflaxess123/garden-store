"use client";

import { Badge } from "@/shared/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield,
  Truck,
  User,
  XCircle,
} from "lucide-react";

export type StatusType =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "active"
  | "inactive"
  | "admin"
  | "user"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  pending: {
    variant: "secondary",
    icon: Clock,
    label: "Ожидает",
  },
  processing: {
    variant: "outline",
    icon: RefreshCw,
    label: "Обработка",
  },
  shipped: {
    variant: "outline",
    icon: Truck,
    label: "Доставляется",
  },
  delivered: {
    variant: "default",
    icon: CheckCircle,
    label: "Доставлен",
  },
  cancelled: {
    variant: "destructive",
    icon: XCircle,
    label: "Отменен",
  },
  active: {
    variant: "default",
    icon: CheckCircle,
    label: "Активен",
  },
  inactive: {
    variant: "secondary",
    icon: AlertCircle,
    label: "Неактивен",
  },
  admin: {
    variant: "default",
    icon: Shield,
    label: "Админ",
  },
  user: {
    variant: "secondary",
    icon: User,
    label: "Пользователь",
  },
  success: {
    variant: "default",
    icon: CheckCircle,
    label: "Успешно",
  },
  warning: {
    variant: "outline",
    icon: AlertCircle,
    label: "Предупреждение",
  },
  error: {
    variant: "destructive",
    icon: XCircle,
    label: "Ошибка",
  },
  info: {
    variant: "outline",
    icon: AlertCircle,
    label: "Информация",
  },
};

export default function StatusBadge({
  status,
  type,
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  // Определяем тип на основе статуса, если не передан явно
  const resolvedType: StatusType =
    type || (status.toLowerCase() as StatusType) || "info";

  const config = statusConfig[resolvedType] || statusConfig.info;
  const Icon = config.icon;

  // Используем переданный статус или дефолтный label
  const displayText = status || config.label;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayText}
    </Badge>
  );
}
