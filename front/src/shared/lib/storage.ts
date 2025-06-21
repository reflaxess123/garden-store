import { logger } from "./logger";

/**
 * Безопасная работа с localStorage
 */
export class Storage {
  private static isClient = typeof window !== "undefined";

  /**
   * Сохраняет данные в localStorage
   */
  static set<T>(key: string, value: T): boolean {
    if (!this.isClient) return false;

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      logger.debug("Data saved to localStorage", {
        key,
        valueType: typeof value,
      });
      return true;
    } catch (error) {
      logger.error("Failed to save to localStorage", error, { key, value });
      return false;
    }
  }

  /**
   * Получает данные из localStorage
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue || null;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;

      const parsedValue = JSON.parse(item) as T;
      logger.debug("Data loaded from localStorage", {
        key,
        valueType: typeof parsedValue,
      });
      return parsedValue;
    } catch (error) {
      logger.error("Failed to load from localStorage", error, { key });
      return defaultValue || null;
    }
  }

  /**
   * Удаляет данные из localStorage
   */
  static remove(key: string): boolean {
    if (!this.isClient) return false;

    try {
      localStorage.removeItem(key);
      logger.debug("Data removed from localStorage", { key });
      return true;
    } catch (error) {
      logger.error("Failed to remove from localStorage", error, { key });
      return false;
    }
  }

  /**
   * Проверяет существование ключа в localStorage
   */
  static has(key: string): boolean {
    if (!this.isClient) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Очищает весь localStorage
   */
  static clear(): boolean {
    if (!this.isClient) return false;

    try {
      localStorage.clear();
      logger.debug("localStorage cleared");
      return true;
    } catch (error) {
      logger.error("Failed to clear localStorage", error);
      return false;
    }
  }

  /**
   * Получает все ключи из localStorage
   */
  static keys(): string[] {
    if (!this.isClient) return [];

    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error("Failed to get localStorage keys", error);
      return [];
    }
  }

  /**
   * Получает размер localStorage в байтах (приблизительно)
   */
  static getSize(): number {
    if (!this.isClient) return 0;

    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      logger.error("Failed to calculate localStorage size", error);
      return 0;
    }
  }
}

/**
 * Специализированные хранилища для конкретных данных
 */
export const storage = {
  // Корзина для неавторизованных пользователей
  cart: {
    get: () => Storage.get<unknown[]>("anonymousCart", []),
    set: (items: unknown[]) => Storage.set("anonymousCart", items),
    clear: () => Storage.remove("anonymousCart"),
  },

  // Настройки пользователя
  userPreferences: {
    get: () => Storage.get<Record<string, unknown>>("userPreferences", {}),
    set: (preferences: Record<string, unknown>) =>
      Storage.set("userPreferences", preferences),
    update: (key: string, value: unknown) => {
      const current = storage.userPreferences.get();
      storage.userPreferences.set({ ...current, [key]: value });
    },
  },

  // История поиска
  searchHistory: {
    get: () => Storage.get<string[]>("searchHistory", []),
    add: (query: string) => {
      const history = storage.searchHistory.get() || [];
      const updated = [query, ...history.filter((h) => h !== query)].slice(
        0,
        10
      );
      Storage.set("searchHistory", updated);
    },
    clear: () => Storage.remove("searchHistory"),
  },

  // Просмотренные товары
  recentlyViewed: {
    get: () => Storage.get<string[]>("recentlyViewed", []),
    add: (productId: string) => {
      const viewed = storage.recentlyViewed.get() || [];
      const updated = [
        productId,
        ...viewed.filter((id) => id !== productId),
      ].slice(0, 20);
      Storage.set("recentlyViewed", updated);
    },
    clear: () => Storage.remove("recentlyViewed"),
  },

  // Временные данные формы
  formDraft: {
    get: (formId: string) =>
      Storage.get<Record<string, unknown>>(`formDraft_${formId}`),
    set: (formId: string, data: Record<string, unknown>) =>
      Storage.set(`formDraft_${formId}`, data),
    clear: (formId: string) => Storage.remove(`formDraft_${formId}`),
  },

  // Настройки UI
  ui: {
    theme: {
      get: () => Storage.get<string>("theme"),
      set: (theme: string) => Storage.set("theme", theme),
    },
    sidebarCollapsed: {
      get: () => Storage.get<boolean>("sidebarCollapsed", false),
      set: (collapsed: boolean) => Storage.set("sidebarCollapsed", collapsed),
    },
    tableSettings: {
      get: (tableId: string) =>
        Storage.get<Record<string, unknown>>(`table_${tableId}`),
      set: (tableId: string, settings: Record<string, unknown>) =>
        Storage.set(`table_${tableId}`, settings),
    },
  },
};

/**
 * Безопасное получение данных из localStorage с типизацией
 */
export function getFromLocalStorage<T = unknown>(
  key: string,
  defaultValue?: T
): T | undefined {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    logger.error(`Error parsing localStorage item: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Безопасное сохранение данных в localStorage
 */
export function setToLocalStorage<T = unknown>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`Error setting localStorage item: ${key}`, error);
  }
}

/**
 * Безопасное удаление данных из localStorage
 */
export function removeFromLocalStorage(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error(`Error removing from localStorage for key: ${key}`, error);
    return false;
  }
}

/**
 * Безопасная очистка localStorage
 */
export function clearLocalStorage(): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    logger.error("Error clearing localStorage", error);
    return false;
  }
}

// SessionStorage utilities
/**
 * Безопасное получение данных из sessionStorage
 */
export function getFromSessionStorage<T = unknown>(
  key: string,
  defaultValue?: T
): T | undefined {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    logger.error(`Error parsing sessionStorage item: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Безопасное сохранение данных в sessionStorage
 */
export function setToSessionStorage<T = unknown>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`Error setting sessionStorage item: ${key}`, error);
  }
}

// Storage event handling
/**
 * Подписка на изменения localStorage
 */
export function subscribeToStorageChanges<T = unknown>(
  key: string,
  callback: (newValue: T | null, oldValue: T | null) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let oldValue: T | null = getFromLocalStorage<T>(key) ?? null;

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key) {
      const newValue = event.newValue
        ? (JSON.parse(event.newValue) as T)
        : null;
      callback(newValue, oldValue);
      oldValue = newValue;
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}
