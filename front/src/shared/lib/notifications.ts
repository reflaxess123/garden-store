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
  context?: Record<string, any>;
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
export function showLoading(message: string, promise: Promise<any>) {
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
    error: string | ((error: any) => string);
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
    loginSuccess: () => showSuccess("Вы успешно вошли в систему"),
    logoutSuccess: () => showSuccess("Вы вышли из системы"),
    loginError: (error?: Error) =>
      showError("Ошибка входа в систему", { error }),
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
};
