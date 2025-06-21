/**
 * Утилиты для работы с URL и навигацией
 */

/**
 * Создает URL с параметрами поиска
 */
export function createUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  const url = new URL(path, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.pathname + url.search;
}

/**
 * Парсит параметры поиска из URL
 */
export function parseSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  return params;
}

/**
 * Обновляет параметры URL без перезагрузки страницы
 */
export function updateUrlParams(
  params: Record<string, string | number | boolean | null | undefined>,
  replace = false
) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  const newUrl = url.pathname + url.search;

  if (replace) {
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.pushState({}, "", newUrl);
  }
}

/**
 * Получает значение параметра из URL
 */
export function getUrlParam(key: string): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/**
 * Проверяет, является ли URL внешним
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Создает безопасную ссылку (добавляет rel="noopener noreferrer" для внешних ссылок)
 */
export function createSafeLink(url: string): {
  href: string;
  target?: string;
  rel?: string;
} {
  if (isExternalUrl(url)) {
    return {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }

  return { href: url };
}

/**
 * Константы маршрутов приложения
 */
export const routes = {
  home: "/",
  catalog: "/catalog",
  product: (slug: string) => `/catalog/${slug}`,
  category: (slug: string) => `/catalog/category/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  order: (id: string) => `/orders/${id}`,
  profile: "/profile",
  favorites: "/favorites",
  contact: "/contact",
  about: "/about",

  // Админ маршруты
  admin: {
    dashboard: "/admin",
    products: "/admin/products",
    product: (id: string) => `/admin/products/${id}`,
    categories: "/admin/categories",
    category: (id: string) => `/admin/categories/${id}`,
    orders: "/admin/orders",
    order: (id: string) => `/admin/orders/${id}`,
    users: "/admin/users",
    user: (id: string) => `/admin/users/${id}`,
    chats: "/admin/chats",
    chat: (id: string) => `/admin/chats/${id}`,
  },

  // API маршруты
  api: {
    products: "/api/products",
    product: (id: string) => `/api/products/${id}`,
    categories: "/api/categories",
    cart: "/api/cart",
    orders: "/api/orders",
    auth: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      register: "/api/auth/register",
      me: "/api/auth/me",
    },
  },
} as const;

/**
 * Утилиты для работы с хлебными крошками
 */
export interface Breadcrumb {
  label: string;
  href?: string;
  active?: boolean;
}

export function createBreadcrumbs(path: string): Breadcrumb[] {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [{ label: "Главная", href: "/" }];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Преобразуем сегменты в читаемые названия
    let label = segment;
    switch (segment) {
      case "catalog":
        label = "Каталог";
        break;
      case "cart":
        label = "Корзина";
        break;
      case "checkout":
        label = "Оформление заказа";
        break;
      case "orders":
        label = "Заказы";
        break;
      case "profile":
        label = "Профиль";
        break;
      case "favorites":
        label = "Избранное";
        break;
      case "contact":
        label = "Контакты";
        break;
      case "about":
        label = "О нас";
        break;
      case "admin":
        label = "Админ-панель";
        break;
      case "products":
        label = "Товары";
        break;
      case "categories":
        label = "Категории";
        break;
      case "users":
        label = "Пользователи";
        break;
      case "chats":
        label = "Чаты";
        break;
      default:
        // Для динамических сегментов (ID, slug) оставляем как есть
        label = decodeURIComponent(segment);
    }

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      active: isLast,
    });
  });

  return breadcrumbs;
}

/**
 * Проверяет, активен ли маршрут
 */
export function isActiveRoute(
  currentPath: string,
  targetPath: string,
  exact = false
): boolean {
  if (exact) {
    return currentPath === targetPath;
  }

  return currentPath.startsWith(targetPath);
}
