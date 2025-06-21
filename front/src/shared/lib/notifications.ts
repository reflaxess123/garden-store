import { toast } from "sonner";
import { logger } from "./logger";

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ErrorNotificationOptions extends NotificationOptions {
  error?: Error | unknown;
  context?: Record<string, unknown>;
}

/**
 * Показывает уведомление об успехе
 */
export function showSuccess(message: string, options?: NotificationOptions) {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Показывает уведомление об ошибке
 */
export function showError(message: string, options?: ErrorNotificationOptions) {
  // Логируем ошибку
  if (options?.error) {
    logger.error(message, options.error, options.context);
  }

  toast.error(message, {
    description: options?.description,
    duration: options?.duration || 6000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Показывает информационное уведомление
 */
export function showInfo(message: string, options?: NotificationOptions) {
  toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Показывает предупреждение
 */
export function showWarning(message: string, options?: NotificationOptions) {
  toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Показывает loading уведомление
 */
export function showLoading(message: string, promise: Promise<unknown>) {
  return toast.promise(promise, {
    loading: message,
    success: "Операция выполнена успешно",
    error: "Произошла ошибка",
  });
}

/**
 * Показывает уведомление с кастомным promise
 */
export function showPromise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error | unknown) => string);
  }
) {
  return toast.promise(promise, options);
}

/**
 * Закрывает все уведомления
 */
export function dismissAll() {
  toast.dismiss();
}

/**
 * Специальные уведомления для частых случаев
 */
export const notifications = {
  // Аутентификация
  auth: {
    loginSuccess: () => {
      toast.success("Добро пожаловать!");
    },

    loginError: (error: Error | unknown) => {
      const message =
        error instanceof Error ? error.message : "Ошибка входа в систему";
      toast.error(message);
    },

    logoutSuccess: () => {
      toast.success("Вы успешно вышли из системы");
    },

    registrationSuccess: () => {
      toast.success("Регистрация прошла успешно! Добро пожаловать!");
    },

    registrationError: (error: Error | unknown) => {
      const message =
        error instanceof Error ? error.message : "Ошибка регистрации";
      toast.error(message);
    },

    unauthorized: () => showError("Необходимо войти в систему"),
  },

  // Корзина
  cart: {
    itemAdded: (productName: string) =>
      showSuccess(`"${productName}" добавлен в корзину`),
    itemRemoved: (productName: string) =>
      showInfo(`"${productName}" удален из корзины`),
    cleared: () => showInfo("Корзина очищена"),
    updateError: (error?: Error) =>
      showError("Ошибка обновления корзины", { error }),
  },

  // Заказы
  orders: {
    created: (orderId: string) => showSuccess(`Заказ #${orderId} создан`),
    updated: (orderId: string) => showSuccess(`Заказ #${orderId} обновлен`),
    cancelled: (orderId: string) => showInfo(`Заказ #${orderId} отменен`),
    error: (error?: Error) =>
      showError("Ошибка при работе с заказом", { error }),
  },

  // Админ операции
  admin: {
    itemCreated: (itemType: string) => showSuccess(`${itemType} создан`),
    itemUpdated: (itemType: string) => showSuccess(`${itemType} обновлен`),
    itemDeleted: (itemType: string) => showInfo(`${itemType} удален`),
    operationError: (operation: string, error?: Error) =>
      showError(`Ошибка при ${operation}`, { error }),
  },

  // Избранное
  favorites: {
    added: (productName: string) =>
      showSuccess(`"${productName}" добавлен в избранное`),
    removed: (productName: string) =>
      showInfo(`"${productName}" удален из избранного`),
    error: (error?: Error) =>
      showError("Ошибка при работе с избранным", { error }),
  },

  // Общие
  common: {
    saveSuccess: () => showSuccess("Данные сохранены"),
    saveError: (error?: Error) => showError("Ошибка сохранения", { error }),
    loadError: (error?: Error) =>
      showError("Ошибка загрузки данных", { error }),
    networkError: () =>
      showError("Ошибка сети. Проверьте подключение к интернету"),
    unexpectedError: (error?: Error) =>
      showError("Произошла неожиданная ошибка", { error }),
  },

  // API
  api: {
    success: (message: string = "Операция выполнена успешно") => {
      toast.success(message);
    },

    error: (
      error: Error | unknown,
      fallbackMessage: string = "Произошла ошибка"
    ) => {
      let message = fallbackMessage;

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object" && "message" in error) {
        message = String((error as { message: unknown }).message);
      }

      toast.error(message);
    },
  },

  // Общие
  generic: {
    success: (message: string) => {
      toast.success(message);
    },

    error: (message: string) => {
      toast.error(message);
    },

    info: (message: string) => {
      toast.info(message);
    },

    warning: (message: string) => {
      toast(message, {
        icon: "⚠️",
      });
    },

    custom: (message: string, options?: Record<string, unknown>) => {
      toast(message, options);
    },
  },
};
