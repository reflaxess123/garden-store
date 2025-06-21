import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";
import React from "react";

/**
 * Утилиты для работы со статусами заказов
 */

// Функция для получения цвета бейджа по статусу
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

// Функция для получения иконки статуса
export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
    case "ожидает":
      return <Clock className="h-4 w-4" />;
    case "processing":
    case "обработка":
      return <RefreshCw className="h-4 w-4" />;
    case "shipped":
    case "доставляется":
      return <Package className="h-4 w-4" />;
    case "delivered":
    case "доставлен":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
    case "отменен":
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

// Функция для получения читаемого статуса
export const getReadableStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Ожидает";
    case "processing":
      return "Обработка";
    case "shipped":
      return "Доставляется";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменен";
    default:
      return status;
  }
};
