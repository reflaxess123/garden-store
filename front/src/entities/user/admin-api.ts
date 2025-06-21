export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
  ordersCount: number;
  favoritesCount: number;
  cartItemsCount: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName?: string;
  isAdmin: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  fullName?: string;
  isAdmin?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка получения пользователей: ${response.status}`);
  }

  return response.json();
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка получения пользователя: ${response.status}`);
  }

  return response.json();
}

export async function createAdminUser(
  userData: CreateUserPayload
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || `Ошибка создания пользователя: ${response.status}`
    );
  }

  return response.json();
}

export async function updateAdminUser(
  userId: string,
  userData: UpdateUserPayload
): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || `Ошибка обновления пользователя: ${response.status}`
    );
  }

  return response.json();
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || `Ошибка удаления пользователя: ${response.status}`
    );
  }
}
