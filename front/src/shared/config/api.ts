// API маршруты
export const API_ROUTES = {
  // Авторизация
  AUTH: {
    SIGNIN: "/api/auth/signin",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
  },

  // Продукты
  PRODUCTS: {
    LIST: "/api/products",
    BY_ID: (id: string) => `/api/products/${id}`,
    BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
    BY_CATEGORY: (categorySlug: string) =>
      `/api/products/category/${categorySlug}`,
    BESTSELLERS: "/api/products/bestsellers",
    SEARCH: "/api/products/search",
  },

  // Категории
  CATEGORIES: {
    LIST: "/api/categories",
    BY_ID: (id: string) => `/api/categories/${id}`,
    BY_SLUG: (slug: string) => `/api/categories/${slug}`,
  },

  // Корзина
  CART: {
    GET: "/api/cart",
    ADD: "/api/cart/add",
    UPDATE: (cartId: string) => `/api/cart/${cartId}`,
    REMOVE: (cartId: string) => `/api/cart/${cartId}`,
    CLEAR: "/api/cart",
    MERGE: "/api/cart/merge",
  },

  // Заказы
  ORDERS: {
    LIST: "/api/orders",
    BY_ID: (id: string) => `/api/orders/${id}`,
    CREATE: "/api/orders",
    UPDATE: (id: string) => `/api/orders/${id}`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
  },

  // Избранное
  FAVOURITES: {
    LIST: "/api/favourites",
    ADD: "/api/favourites",
    REMOVE: (productId: string) => `/api/favourites/${productId}`,
    TOGGLE: (productId: string) => `/api/favourites/${productId}/toggle`,
  },

  // Уведомления
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    BY_ID: (id: string) => `/api/notifications/${id}`,
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
  },

  // Чат
  CHAT: {
    LIST: "/api/chats",
    BY_ID: (id: string) => `/api/chats/${id}`,
    CREATE: "/api/chats",
    MESSAGES: (chatId: string) => `/api/chats/${chatId}/messages`,
    SEND_MESSAGE: (chatId: string) => `/api/chats/${chatId}/messages`,
  },

  // Админка
  ADMIN: {
    // Продукты
    PRODUCTS: {
      LIST: "/api/admin/products",
      BY_ID: (id: string) => `/api/admin/products/${id}`,
      CREATE: "/api/admin/products",
      UPDATE: (id: string) => `/api/admin/products/${id}`,
      DELETE: (id: string) => `/api/admin/products/${id}`,
    },

    // Категории
    CATEGORIES: {
      LIST: "/api/admin/categories",
      BY_ID: (id: string) => `/api/admin/categories/${id}`,
      CREATE: "/api/admin/categories",
      UPDATE: (id: string) => `/api/admin/categories/${id}`,
      DELETE: (id: string) => `/api/admin/categories/${id}`,
    },

    // Заказы
    ORDERS: {
      LIST: "/api/admin/orders",
      BY_ID: (id: string) => `/api/admin/orders/${id}`,
      UPDATE: (id: string) => `/api/admin/orders/${id}`,
      DELETE: (id: string) => `/api/admin/orders/${id}`,
    },

    // Пользователи
    USERS: {
      LIST: "/api/admin/users",
      BY_ID: (id: string) => `/api/admin/users/${id}`,
      CREATE: "/api/admin/users",
      UPDATE: (id: string) => `/api/admin/users/${id}`,
      DELETE: (id: string) => `/api/admin/users/${id}`,
    },

    // Чаты
    CHATS: {
      LIST: "/api/admin/chats",
      BY_ID: (id: string) => `/api/admin/chats/${id}`,
      CLOSE: (id: string) => `/api/admin/chats/${id}/close`,
    },
  },
} as const;

// Конфигурация пагинации
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Конфигурация сортировки
export const SORTING = {
  DEFAULT_ORDER: "desc" as const,
  ORDERS: ["asc", "desc"] as const,
} as const;

// Конфигурация загрузки файлов
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    DOCUMENTS: ["application/pdf", "text/plain"],
  },
  CHUNK_SIZE: 1024 * 1024, // 1MB
} as const;

// Конфигурация кэширования
export const CACHE = {
  STALE_TIME: {
    SHORT: 30 * 1000, // 30 секунд
    MEDIUM: 5 * 60 * 1000, // 5 минут
    LONG: 30 * 60 * 1000, // 30 минут
  },
  GC_TIME: {
    SHORT: 5 * 60 * 1000, // 5 минут
    MEDIUM: 10 * 60 * 1000, // 10 минут
    LONG: 30 * 60 * 1000, // 30 минут
  },
} as const;

// Конфигурация WebSocket
export const WEBSOCKET = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000,
} as const;

// Конфигурация уведомлений
export const NOTIFICATIONS = {
  DEFAULT_DURATION: 5000,
  POSITIONS: ["top-right", "top-left", "bottom-right", "bottom-left"] as const,
  MAX_VISIBLE: 5,
} as const;
