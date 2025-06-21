"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { logger } from "@/shared";
import { useCallback, useEffect, useRef, useState } from "react";

export interface WebSocketMessage {
  type: string;
  chatId?: string;
  message?: string;
  senderId?: string;
  senderName?: string;
  timestamp?: string;
  isFromAdmin?: boolean;
  data?: Record<string, unknown>;
}

export interface UseWebSocketProps {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// Перегрузки функции для разных способов вызова
export function useWebSocket(options: UseWebSocketProps): {
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
};

export function useWebSocket(
  url: string,
  options?: {
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    reconnectAttempts?: number;
  }
): {
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
};

export function useWebSocket(
  urlOrOptions?: string | UseWebSocketProps,
  options?: {
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    reconnectAttempts?: number;
  }
) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Определяем параметры в зависимости от способа вызова
  const isUrlProvided = typeof urlOrOptions === "string";
  const finalOptions = isUrlProvided ? options : urlOrOptions;

  // Стабилизируем callback'и
  const onMessageRef = useRef(finalOptions?.onMessage);
  const onConnectRef = useRef(finalOptions?.onConnect);
  const onDisconnectRef = useRef(finalOptions?.onDisconnect);

  // Создаем ref для connect функции заранее
  const connectRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    onMessageRef.current = finalOptions?.onMessage;
  }, [finalOptions?.onMessage]);

  useEffect(() => {
    onConnectRef.current = finalOptions?.onConnect;
  }, [finalOptions?.onConnect]);

  useEffect(() => {
    onDisconnectRef.current = finalOptions?.onDisconnect;
  }, [finalOptions?.onDisconnect]);

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
      logger.debug(
        "Пользователь не авторизован, WebSocket подключение отменено",
        {
          component: "useWebSocket",
          action: "connect",
        }
      );
      return;
    }

    // Если уже есть активное соединение или подключение в процессе, не создаваем новое
    if (
      ws.current &&
      (ws.current.readyState === WebSocket.OPEN ||
        ws.current.readyState === WebSocket.CONNECTING)
    ) {
      logger.debug("WebSocket уже подключен или подключается", {
        component: "useWebSocket",
        readyState: ws.current.readyState,
      });
      return;
    }

    // Закрываем предыдущее соединение если оно есть
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      // Определяем endpoint
      let endpoint: string;
      if (isUrlProvided && typeof urlOrOptions === "string") {
        // Используем переданный URL
        endpoint = urlOrOptions;
      } else {
        // Автоматически определяем URL на основе роли пользователя
        const wsUrl =
          process.env.NEXT_PUBLIC_WS_URL || "wss://server.sadovnick.store";
        endpoint = user.isAdmin
          ? `${wsUrl}/ws/admin/${user.id}`
          : `${wsUrl}/ws/chat/${user.id}`;
      }

      logger.info("Подключение к WebSocket", {
        component: "useWebSocket",
        endpoint,
        userId: user.id,
        isAdmin: user.isAdmin,
      });

      ws.current = new WebSocket(endpoint);

      ws.current.onopen = () => {
        logger.info("WebSocket подключен", {
          component: "useWebSocket",
          userId: user.id,
        });
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
          logger.debug("Получено сообщение WebSocket", {
            component: "useWebSocket",
            messageType: message.type,
            chatId: message.chatId,
          });
          onMessageRef.current?.(message);
        } catch (error) {
          logger.error("Ошибка парсинга WebSocket сообщения", error, {
            component: "useWebSocket",
            eventData: event.data,
          });
        }
      };

      ws.current.onclose = (event) => {
        logger.info("WebSocket отключен", {
          component: "useWebSocket",
          code: event.code,
          reason: event.reason,
        });
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
          logger.info("Планируется переподключение WebSocket", {
            component: "useWebSocket",
            delay,
            attempt: reconnectAttempts.current + 1,
            maxAttempts: maxReconnectAttempts,
          });

          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            // Используем ref для избежания циклической зависимости
            connectRef.current?.();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          logger.error("Не удалось восстановить WebSocket соединение", null, {
            component: "useWebSocket",
            attempts: reconnectAttempts.current,
          });
          setConnectionError("Не удалось восстановить соединение");
        }
      };

      ws.current.onerror = (error) => {
        logger.error("Ошибка WebSocket", error, {
          component: "useWebSocket",
          userId: user.id,
        });
        setConnectionError("Ошибка подключения");
      };
    } catch (error) {
      logger.error("Ошибка создания WebSocket", error, {
        component: "useWebSocket",
        userId: user.id,
      });
      setConnectionError("Ошибка создания подключения");
    }
  }, [isAuthenticated, user, isUrlProvided, urlOrOptions]);

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
        logger.info("Страница снова видна, переподключение к WebSocket", {
          component: "useWebSocket",
          userId: user.id,
        });
        connectRef.current?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, user, isConnected]);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify(message));
          logger.debug("Отправлено WebSocket сообщение", {
            component: "useWebSocket",
            messageType: message.type,
            chatId: message.chatId,
          });
        } catch (error) {
          logger.error("Ошибка отправки WebSocket сообщения", error, {
            component: "useWebSocket",
            messageType: message.type,
            chatId: message.chatId,
          });
          setConnectionError("Ошибка отправки сообщения");
        }
      } else {
        logger.warn("WebSocket не подключен, сообщение не отправлено", {
          component: "useWebSocket",
          userId: user?.id,
        });
        setConnectionError("Соединение не установлено");
      }
    },
    [user?.id, ws]
  );

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect,
  };
}
