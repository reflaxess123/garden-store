"use client";

import {
  getUnreadCountApiNotificationsUnreadCountGet,
  getUserNotificationsApiNotificationsGet,
  markAllNotificationsReadApiNotificationsMarkAllReadPost,
  markNotificationReadApiNotificationsNotificationIdPatch,
} from "@/shared/api/generated";
import type { NotificationInDB } from "@/shared/api/generated/types";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  MessageCircle,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "chat_message":
      return <MessageCircle className="h-4 w-4" />;
    case "order_status":
      return <Package className="h-4 w-4" />;
    case "new_order":
      return <ShoppingCart className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "только что";
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ч назад`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} д назад`;

  return date.toLocaleDateString("ru-RU");
};

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Получаем количество непрочитанных уведомлений
  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadCountApiNotificationsUnreadCountGet(),
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Получаем список уведомлений
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      getUserNotificationsApiNotificationsGet({
        unread_only: false,
        limit: 20,
      }),
    enabled: isOpen,
  });

  // Мутация для отметки уведомления как прочитанного
  const markAsReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      markNotificationReadApiNotificationsNotificationIdPatch(id, {
        is_read: isRead,
      }),
    onMutate: async ({ id, isRead }) => {
      // Отменяем любые исходящие рефетчи
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unread-count"],
      });

      // Сохраняем предыдущие данные
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousUnreadCount = queryClient.getQueryData([
        "notifications",
        "unread-count",
      ]);

      // Оптимистично обновляем данные
      queryClient.setQueryData(
        ["notifications"],
        (old: NotificationInDB[] | undefined) => {
          if (!old) return old;
          return old.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: isRead }
              : notification
          );
        }
      );

      // Обновляем счетчик непрочитанных
      if (isRead) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
            };
          }
        );
      }

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnreadCount
        );
      }
      toast.error("Не удалось обновить уведомление");
    },
    onSuccess: () => {
      toast.success("Уведомление отмечено как прочитанное");
    },
    onSettled: () => {
      // Обновляем данные в любом случае
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Мутация для отметки всех уведомлений как прочитанных
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsReadApiNotificationsMarkAllReadPost(),
    onMutate: async () => {
      // Отменяем любые исходящие рефетчи
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unread-count"],
      });

      // Сохраняем предыдущие данные
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousUnreadCount = queryClient.getQueryData([
        "notifications",
        "unread-count",
      ]);

      // Оптимистично обновляем данные
      queryClient.setQueryData(
        ["notifications"],
        (old: NotificationInDB[] | undefined) => {
          if (!old) return old;
          return old.map((notification) => ({ ...notification, isRead: true }));
        }
      );

      // Обнуляем счетчик непрочитанных
      queryClient.setQueryData(
        ["notifications", "unread-count"],
        (old: any) => {
          if (!old) return old;
          return { ...old, unreadCount: 0 };
        }
      );

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnreadCount
        );
      }
      toast.error("Не удалось отметить все уведомления как прочитанные");
    },
    onSuccess: () => {
      toast.success("Все уведомления отмечены как прочитанные");
    },
    onSettled: () => {
      // Обновляем данные в любом случае
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  const handleMarkAsRead = (notification: NotificationInDB) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id, isRead: true });
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const unreadCountValue = (unreadCount as any)?.unreadCount || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCountValue > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCountValue > 99 ? "99+" : unreadCountValue}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Уведомления</h3>
          {unreadCountValue > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Прочитать все
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Загрузка...
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        notification.type === "chat_message" &&
                          "bg-blue-100 text-blue-600",
                        notification.type === "order_status" &&
                          "bg-green-100 text-green-600",
                        notification.type === "new_order" &&
                          "bg-orange-100 text-orange-600",
                        notification.type === "system" &&
                          "bg-gray-100 text-gray-600"
                      )}
                    >
                      <NotificationIcon type={notification.type} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет уведомлений</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
