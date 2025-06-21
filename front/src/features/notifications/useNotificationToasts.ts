import { useAuth } from "@/features/auth/AuthContext";
import { useWebSocketContext } from "@/features/chat/WebSocketContext";
import { useEffect } from "react";
import { toast } from "sonner";

export function useNotificationToasts(enabled: boolean = true) {
  const { addMessageListener } = useWebSocketContext();
  const { user } = useAuth();

  useEffect(() => {
    if (!enabled || !user) return;

    const removeListener = addMessageListener((message) => {
      // Показываем toast только для уведомлений типа "notification"
      // Для "new_message" не показываем toast, чтобы избежать дублирования
      if (message.type === "notification") {
        const notificationData = message.data;

        toast(String(notificationData?.title || "Новое уведомление"), {
          description: String(notificationData?.message || ""),
          duration: 5000,
          action: {
            label: "Посмотреть",
            onClick: () => {
              // Можно добавить навигацию к соответствующей странице
              if (notificationData?.type === "chat_message") {
                const url = user.isAdmin ? "/admin/chats" : "/support/chat";
                window.location.href = url;
              } else if (notificationData?.type === "order_status") {
                window.location.href = "/orders";
              } else if (
                notificationData?.type === "new_order" &&
                user.isAdmin
              ) {
                window.location.href = "/admin/orders";
              }
            },
          },
        });
      }
    });

    return removeListener;
  }, [addMessageListener, enabled, user]);
}
