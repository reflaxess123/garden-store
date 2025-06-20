"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { useWebSocketContext } from "@/features/chat/WebSocketContext";
import { WebSocketMessage } from "@/features/chat/useWebSocket";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Типы (те же что в виджете)
interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  isFromAdmin: boolean;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  senderEmail?: string;
}

interface Chat {
  id: string;
  userId: string;
  isActive: boolean;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  lastMessage?: string;
  messages: ChatMessage[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// API функции (те же что в виджете)
async function getUserChats(): Promise<Chat[]> {
  const response = await fetch(`${API_BASE}/api/chats`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch chats");
  return response.json();
}

async function createOrGetChat(): Promise<Chat> {
  const response = await fetch(`${API_BASE}/api/chats`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to create chat");
  return response.json();
}

async function getChatDetail(chatId: string): Promise<Chat> {
  const response = await fetch(`${API_BASE}/api/chats/${chatId}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch chat detail");
  return response.json();
}

async function sendMessage(
  chatId: string,
  message: string
): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

function SupportChatPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const queryClient = useQueryClient();

  const { data: chats = [], refetch: refetchChats } = useQuery({
    queryKey: ["userChats"],
    queryFn: getUserChats,
    enabled: isAuthenticated && !user?.isAdmin,
  });

  const { data: chatDetail, refetch: refetchChatDetail } = useQuery({
    queryKey: ["chatDetail", currentChat?.id],
    queryFn: () => (currentChat ? getChatDetail(currentChat.id) : null),
    enabled: !!currentChat,
  });

  const createChatMutation = useMutation({
    mutationFn: createOrGetChat,
    onSuccess: (chat) => {
      setCurrentChat(chat);
      refetchChats();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: string; message: string }) =>
      sendMessage(chatId, message),
    onSuccess: () => {
      setCurrentMessage("");
      refetchChatDetail();
      refetchChats();
    },
  });

  // WebSocket для реал-тайм обновлений
  const { isConnected, addMessageListener, clearUnreadCount } =
    useWebSocketContext();

  // Сбрасываем счетчик непрочитанных при открытии страницы
  useEffect(() => {
    clearUnreadCount();
  }, [clearUnreadCount]);

  // Добавляем слушатель сообщений
  useEffect(() => {
    const removeListener = addMessageListener((message: WebSocketMessage) => {
      if (message.type === "new_message" || message.type === "admin_message") {
        refetchChats();
        if (currentChat && message.chatId === currentChat.id) {
          refetchChatDetail();
        }
      }
    });

    return removeListener;
  }, [addMessageListener, refetchChats, refetchChatDetail, currentChat]);

  // Инициализация чата
  useEffect(() => {
    if (isAuthenticated && !user?.isAdmin && chats.length === 0) {
      createChatMutation.mutate();
    } else if (chats.length > 0 && !currentChat) {
      setCurrentChat(chats[0]);
    }
  }, [isAuthenticated, user, chats, currentChat, createChatMutation]);

  // Если админ - переадресуем на админскую панель
  if (user?.isAdmin) {
    router.push("/admin/chats");
    return null;
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    sendMessageMutation.mutate({
      chatId: currentChat.id,
      message: currentMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Заголовок страницы */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Поддержка</h1>
            <p className="text-muted-foreground">
              Обратитесь к нашей службе поддержки
            </p>
          </div>
        </div>

        {/* Статус подключения */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>{isConnected ? "Подключен к чату" : "Подключение..."}</span>
        </div>
      </div>

      {/* Главная область чата */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Чат с поддержкой
            </CardTitle>
            {currentChat && (
              <Badge variant="outline">Чат #{currentChat.id.slice(-8)}</Badge>
            )}
          </div>
        </CardHeader>

        {/* Сообщения */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full p-4 overflow-y-auto">
            {!currentChat ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Создание чата...</p>
                  <p className="text-muted-foreground">Пожалуйста, подождите</p>
                </div>
              </div>
            ) : chatDetail?.messages?.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  Добро пожаловать в поддержку!
                </p>
                <p className="text-muted-foreground mb-6">
                  Опишите вашу проблему, и мы поможем вам её решить
                </p>
                <div className="bg-muted rounded-lg p-4 max-w-md mx-auto">
                  <h3 className="font-medium mb-2">Как мы можем помочь:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Вопросы по заказам</li>
                    <li>• Помощь с товарами</li>
                    <li>• Техническая поддержка</li>
                    <li>• Общие вопросы</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatDetail?.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isFromAdmin ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.isFromAdmin
                          ? "bg-muted text-foreground"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {message.isFromAdmin && (
                        <div className="text-xs font-medium mb-2 opacity-80">
                          Поддержка
                        </div>
                      )}
                      <div className="text-sm leading-relaxed">
                        {message.message}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(message.createdAt).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {/* Ввод сообщения */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-3">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваше сообщение..."
              disabled={sendMessageMutation.isPending || !currentChat}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={
                !currentMessage.trim() ||
                sendMessageMutation.isPending ||
                !currentChat
              }
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Отправить
            </Button>
          </div>

          {sendMessageMutation.isPending && (
            <p className="text-xs text-muted-foreground mt-2">
              Отправка сообщения...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function SupportChatPageWithAuth() {
  return (
    <AuthGuard>
      <SupportChatPage />
    </AuthGuard>
  );
}
