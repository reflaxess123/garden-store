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
    get: () => Storage.get<any[]>("anonymousCart", []),
    set: (items: any[]) => Storage.set("anonymousCart", items),
    clear: () => Storage.remove("anonymousCart"),
  },

  // Настройки пользователя
  userPreferences: {
    get: () => Storage.get<Record<string, any>>("userPreferences", {}),
    set: (preferences: Record<string, any>) =>
      Storage.set("userPreferences", preferences),
    update: (key: string, value: any) => {
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
      Storage.get<Record<string, any>>(`formDraft_${formId}`),
    set: (formId: string, data: Record<string, any>) =>
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
        Storage.get<Record<string, any>>(`table_${tableId}`),
      set: (tableId: string, settings: Record<string, any>) =>
        Storage.set(`table_${tableId}`, settings),
    },
  },
};
