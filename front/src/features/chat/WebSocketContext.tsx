"use client";

import { logger } from "@/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWebSocket, WebSocketMessage } from "./useWebSocket";

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  messages: WebSocketMessage[];
  unreadCount: number;
  clearUnreadCount: () => void;
  addMessageListener: (
    listener: (message: WebSocketMessage) => void
  ) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageListeners, setMessageListeners] = useState<
    Set<(message: WebSocketMessage) => void>
  >(new Set());

  // Используем ref для доступа к актуальному состоянию listeners
  const messageListenersRef = useRef(messageListeners);

  useEffect(() => {
    messageListenersRef.current = messageListeners;
  }, [messageListeners]);

  // Стабилизируем callback'и
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      setMessages((prev) => [...prev, message]);

      // Увеличиваем счетчик непрочитанных для сообщений от админов
      if (message.type === "new_message" && message.isFromAdmin) {
        setUnreadCount((prev) => prev + 1);
      }

      // Используем ref для доступа к актуальному состоянию listeners
      messageListenersRef.current.forEach((listener) => listener(message));
    },
    [] // Убираем messageListeners из зависимостей
  );

  const handleConnect = useCallback(() => {
    logger.debug("WebSocket подключен через контекст", {
      component: "WebSocketContext",
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    logger.debug("WebSocket отключен через контекст", {
      component: "WebSocketContext",
    });
  }, []);

  const { isConnected, connectionError, sendMessage, connect, disconnect } =
    useWebSocket({
      onMessage: handleMessage,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
    });

  const addMessageListener = useCallback(
    (listener: (message: WebSocketMessage) => void) => {
      setMessageListeners((prev) => new Set([...prev, listener]));

      return () => {
        setMessageListeners((prev) => {
          const newSet = new Set(prev);
          newSet.delete(listener);
          return newSet;
        });
      };
    },
    []
  );

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Очищаем сообщения при отключении
  useEffect(() => {
    if (!isConnected) {
      setMessages([]);
      setUnreadCount(0);
    }
  }, [isConnected]);

  // Мемоизируем значение контекста
  const value = useRef<WebSocketContextType>({
    isConnected: false,
    connectionError: null,
    sendMessage: () => {},
    connect: () => {},
    disconnect: () => {},
    messages: [],
    unreadCount: 0,
    clearUnreadCount: () => {},
    addMessageListener: () => () => {},
  });

  // Обновляем значение только при изменении зависимостей
  useEffect(() => {
    value.current = {
      isConnected,
      connectionError,
      sendMessage,
      connect,
      disconnect,
      messages,
      unreadCount,
      clearUnreadCount,
      addMessageListener,
    };
  }, [
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect,
    messages,
    unreadCount,
    clearUnreadCount,
    addMessageListener,
  ]);

  return (
    <WebSocketContext.Provider value={value.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}
