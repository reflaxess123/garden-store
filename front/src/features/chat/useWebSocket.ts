"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";

export interface WebSocketMessage {
  type: string;
  chatId?: string;
  message?: string;
  senderId?: string;
  senderName?: string;
  timestamp?: string;
  isFromAdmin?: boolean;
  data?: any;
}

interface UseWebSocketProps {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  onMessage,
  onConnect,
  onDisconnect,
}: UseWebSocketProps = {}) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Стабилизируем callback'и
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  // Создаем ref для connect функции заранее
  const connectRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onConnectRef.current = onConnect;
  }, [onConnect]);

  useEffect(() => {
    onDisconnectRef.current = onDisconnect;
  }, [onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, "Пользователь отключился");
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      console.log(
        "Пользователь не авторизован, WebSocket подключение отменено"
      );
      return;
    }

    // Если уже есть активное соединение или подключение в процессе, не создаваем новое
    if (
      ws.current &&
      (ws.current.readyState === WebSocket.OPEN ||
        ws.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket уже подключен или подключается");
      return;
    }

    // Закрываем предыдущее соединение если оно есть
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://server.sadovnick.store";
      const endpoint = user.isAdmin
        ? `${wsUrl}/ws/admin/${user.id}`
        : `${wsUrl}/ws/chat/${user.id}`;

      console.log("Подключение к WebSocket:", endpoint);

      ws.current = new WebSocket(endpoint);

      ws.current.onopen = () => {
        console.log("WebSocket подключен");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Запускаем ping каждые 30 секунд
        pingInterval.current = setInterval(() => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);

        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("Получено сообщение WebSocket:", message);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error("Ошибка парсинга WebSocket сообщения:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket отключен", event.code, event.reason);
        setIsConnected(false);

        // Очищаем ping интервал
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }

        onDisconnectRef.current?.();

        // Переподключение при неожиданном закрытии (только если не было принудительного отключения)
        if (
          event.code !== 1000 &&
          event.code !== 1001 &&
          reconnectAttempts.current < maxReconnectAttempts &&
          isAuthenticated &&
          user
        ) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Экспоненциальная задержка
          console.log(
            `Переподключение через ${delay}ms (попытка ${
              reconnectAttempts.current + 1
            })`
          );

          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            // Используем ref для избежания циклической зависимости
            connectRef.current?.();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Не удалось восстановить соединение");
        }
      };

      ws.current.onerror = (error) => {
        console.error("Ошибка WebSocket:", error);
        setConnectionError("Ошибка подключения");
      };
    } catch (error) {
      console.error("Ошибка создания WebSocket:", error);
      setConnectionError("Ошибка создания подключения");
    }
  }, [isAuthenticated, user]);

  // Создаем стабильные ссылки на функции
  const disconnectRef = useRef(disconnect);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);

  // Автоматическое подключение при монтировании и изменении авторизации
  useEffect(() => {
    if (isAuthenticated && user) {
      connectRef.current?.();
    } else {
      disconnectRef.current();
    }

    return () => {
      disconnectRef.current();
    };
  }, [isAuthenticated, user]);

  // Переподключение при потере фокуса/восстановлении
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isAuthenticated &&
        user &&
        !isConnected
      ) {
        console.log("Страница снова видна, переподключение к WebSocket");
        connectRef.current?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, user, isConnected]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        console.log("Отправлено WebSocket сообщение:", message);
      } catch (error) {
        console.error("Ошибка отправки WebSocket сообщения:", error);
        setConnectionError("Ошибка отправки сообщения");
      }
    } else {
      console.warn("WebSocket не подключен, сообщение не отправлено");
      setConnectionError("Соединение не установлено");
    }
  }, []);

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect,
  };
}
