"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useWebSocketContext } from "@/features/chat/WebSocketContext";
import { WebSocketMessage } from "@/features/chat/useWebSocket";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Minimize2, Send, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Типы из автоматически сгенерированного API
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

// API функции (используем fetch напрямую для простоты)
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

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
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
  const { isConnected, addMessageListener } = useWebSocketContext();

  // Добавляем слушатель сообщений
  useEffect(() => {
    const removeListener = addMessageListener((message: WebSocketMessage) => {
      if (message.type === "new_message" || message.type === "admin_message") {
        // Обновляем данные
        refetchChats();
        if (currentChat && message.chatId === currentChat.id) {
          refetchChatDetail();
        }

        // Обновляем счетчик непрочитанных, если чат закрыт
        if (!isOpen && message.isFromAdmin) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    return removeListener;
  }, [
    addMessageListener,
    refetchChats,
    refetchChatDetail,
    currentChat,
    isOpen,
  ]);

  // Подсчет непрочитанных сообщений
  useEffect(() => {
    const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setUnreadCount(totalUnread);
  }, [chats]);

  // Сброс счетчика при открытии чата
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Не показываем виджет для админов
  if (!isAuthenticated || user?.isAdmin) {
    return null;
  }

  const handleOpenChat = () => {
    if (chats.length > 0) {
      setCurrentChat(chats[0]);
    } else {
      createChatMutation.mutate();
    }
    setIsOpen(true);
    setIsMinimized(false);
  };

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
    <>
      {/* Плавающая кнопка */}
      {!isOpen && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50">
          <Button
            onClick={handleOpenChat}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl relative bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-50 w-80 h-96 md:w-96 md:h-[500px]">
          <Card className="h-full flex flex-col shadow-2xl">
            <CardHeader className="p-4 border-b bg-green-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Поддержка</CardTitle>
                <div className="flex items-center gap-2">
                  {/* Ссылка на полную страницу чата */}
                  <Link href="/support/chat">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-green-700 h-8 w-8 p-0"
                      title="Открыть в полном размере"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Button>
                  </Link>

                  {/* Минимизировать */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-green-700 h-8 w-8 p-0"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>

                  {/* Закрыть */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-green-700 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Статус подключения */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-200" : "bg-red-300"
                  }`}
                />
                <span className="opacity-90">
                  {isConnected ? "Онлайн" : "Отключен"}
                </span>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Сообщения */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <div className="h-full p-4 overflow-y-auto">
                    {chatDetail?.messages?.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Начните диалог с поддержкой</p>
                        <p className="text-sm">Мы ответим в ближайшее время</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatDetail?.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.isFromAdmin
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.isFromAdmin
                                  ? "bg-muted text-foreground"
                                  : "bg-green-600 text-white"
                              }`}
                            >
                              {message.isFromAdmin && (
                                <div className="text-xs font-medium mb-1 opacity-80">
                                  Поддержка
                                </div>
                              )}
                              <div className="text-sm">{message.message}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString(
                                  "ru-RU",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Ввод сообщения */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Введите сообщение..."
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
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
