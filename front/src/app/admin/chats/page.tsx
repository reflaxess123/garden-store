"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useWebSocketContext } from "@/features/chat/WebSocketContext";
import { WebSocketMessage } from "@/features/chat/useWebSocket";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Eye, MessageCircle, Send, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

// Типы (те же что и в других компонентах)
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

// Админские API функции
async function getAdminChats(): Promise<Chat[]> {
  const response = await fetch(`${API_BASE}/api/admin/chats`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch admin chats");
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

export default function AdminChatsPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Загружаем все чаты
  const {
    data: chats = [],
    refetch: refetchChats,
    isLoading,
  } = useQuery({
    queryKey: ["adminChats"],
    queryFn: getAdminChats,
    enabled: isAuthenticated && user?.isAdmin,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Загружаем детали выбранного чата
  const { data: chatDetail, refetch: refetchChatDetail } = useQuery({
    queryKey: ["adminChatDetail", selectedChat?.id],
    queryFn: () => (selectedChat ? getChatDetail(selectedChat.id) : null),
    enabled: !!selectedChat,
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
      if (message.type === "new_message") {
        // Обновляем список чатов
        refetchChats();

        // Если это сообщение из текущего чата, обновляем детали
        if (selectedChat && message.chatId === selectedChat.id) {
          refetchChatDetail();
        }
      }
    });

    return removeListener;
  }, [addMessageListener, refetchChats, refetchChatDetail, selectedChat]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedChat) return;

    sendMessageMutation.mutate({
      chatId: selectedChat.id,
      message: currentMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openChatModal = (chat: Chat) => {
    setSelectedChat(chat);
    setIsModalOpen(true);
  };

  const totalUnreadMessages = chats.reduce(
    (sum, chat) => sum + chat.unreadCount,
    0
  );

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Доступ запрещен</h2>
        <p className="text-muted-foreground">
          Эта страница доступна только администраторам
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление чатами</h1>
          <p className="text-muted-foreground">
            Отвечайте на сообщения от пользователей
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Статус подключения */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>{isConnected ? "Онлайн" : "Отключен"}</span>
          </div>

          {/* Статистика */}
          <div className="flex gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Всего чатов</p>
                  <p className="text-2xl font-bold">{chats.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Непрочитанных</p>
                  <p className="text-2xl font-bold text-red-600">
                    {totalUnreadMessages}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Таблица чатов */}
      <Card>
        <CardHeader>
          <CardTitle>Активные чаты</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Загрузка чатов...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Нет активных чатов</p>
              <p className="text-muted-foreground">
                Чаты появятся, когда пользователи начнут обращаться в поддержку
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Последнее сообщение</TableHead>
                  <TableHead>Время</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chats.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {chat.userName || "Неизвестный"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {chat.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate">
                        {chat.lastMessage || "Нет сообщений"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(chat.lastMessageAt).toLocaleString("ru-RU")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={chat.isActive ? "default" : "secondary"}
                        >
                          {chat.isActive ? "Активный" : "Неактивный"}
                        </Badge>
                        {chat.unreadCount > 0 && (
                          <Badge variant="destructive">
                            {chat.unreadCount} новых
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={isModalOpen && selectedChat?.id === chat.id}
                        onOpenChange={setIsModalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openChatModal(chat)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Открыть
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              Чат с{" "}
                              {chat.userName || "Неизвестный пользователь"}
                            </DialogTitle>
                            <DialogDescription>
                              {chat.userEmail} • Чат #{chat.id.slice(-8)}
                            </DialogDescription>
                          </DialogHeader>

                          {/* Сообщения чата */}
                          <div className="flex flex-col h-[500px]">
                            <div className="flex-1 overflow-y-auto p-4 border rounded-lg mb-4">
                              {chatDetail?.messages?.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>Нет сообщений в этом чате</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {chatDetail?.messages?.map((message) => (
                                    <div
                                      key={message.id}
                                      className={`flex ${
                                        message.isFromAdmin
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      <div
                                        className={`max-w-[70%] rounded-lg p-3 ${
                                          message.isFromAdmin
                                            ? "bg-blue-600 text-white"
                                            : "bg-muted text-foreground"
                                        }`}
                                      >
                                        {!message.isFromAdmin && (
                                          <div className="text-xs font-medium mb-1 opacity-80">
                                            {message.senderName ||
                                              "Пользователь"}
                                          </div>
                                        )}
                                        <div className="text-sm">
                                          {message.message}
                                        </div>
                                        <div className="text-xs opacity-70 mt-1">
                                          {new Date(
                                            message.createdAt
                                          ).toLocaleString("ru-RU", {
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

                            {/* Ввод ответа */}
                            <div className="flex gap-2">
                              <Input
                                value={currentMessage}
                                onChange={(e) =>
                                  setCurrentMessage(e.target.value)
                                }
                                onKeyPress={handleKeyPress}
                                placeholder="Введите ответ..."
                                disabled={sendMessageMutation.isPending}
                                className="flex-1"
                              />
                              <Button
                                onClick={handleSendMessage}
                                disabled={
                                  !currentMessage.trim() ||
                                  sendMessageMutation.isPending
                                }
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
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
