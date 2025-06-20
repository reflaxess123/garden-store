"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useWebSocketContext } from "@/features/chat/WebSocketContext";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChatButton() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useWebSocketContext();

  // Не показываем кнопку для админов или неавторизованных пользователей
  if (!isAuthenticated || user?.isAdmin) {
    return null;
  }

  const handleChatClick = () => {
    router.push("/support/chat");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={handleChatClick}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline ml-2">Чат</span>
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
