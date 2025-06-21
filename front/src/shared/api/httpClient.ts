import { logger } from "../lib/logger";

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export class HttpClientError extends Error {
  constructor(public error: ApiError) {
    super(error.message);
    this.name = "HttpClientError";
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

class HttpClient {
  private baseUrl: string;
  private defaultTimeout = 10000; // 10 секунд

  constructor() {
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    if (typeof window !== "undefined") return ""; // Use relative path on client-side
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return process.env.FRONTEND_INTERNAL_URL || "http://localhost:3000";
  }

  private async handleResponse<T>(
    response: Response,
    endpoint: string
  ): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      logger.apiError(endpoint, error, {
        status: response.status,
        contentType,
      });
      throw new HttpClientError({
        message: "Failed to parse response",
        status: response.status,
        details: error,
      });
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data.message
          ? data.message
          : `HTTP ${response.status}: ${response.statusText}`;

      logger.apiError(endpoint, errorMessage, {
        status: response.status,
        data,
      });

      throw new HttpClientError({
        message: errorMessage,
        status: response.status,
        details: data,
      });
    }

    logger.apiSuccess(endpoint, { status: response.status });
    return data;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    // Добавляем дефолтные заголовки
    const headers = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
        credentials: "include", // Для работы с cookies
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response, endpoint);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        logger.apiError(endpoint, "Request timeout", { timeout });
        throw new HttpClientError({
          message: "Request timeout",
          status: 408,
          details: { timeout },
        });
      }

      if (error instanceof HttpClientError) {
        throw error;
      }

      logger.apiError(endpoint, error, { url });
      throw new HttpClientError({
        message: error.message || "Network error",
        status: 0,
        details: error,
      });
    }
  }

  // GET запрос
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  // POST запрос
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT запрос
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH запрос
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE запрос
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Загрузка файлов
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const { headers, ...restOptions } = options || {};

    // Убираем Content-Type для FormData, браузер установит его автоматически
    return this.request<T>(endpoint, {
      ...restOptions,
      method: "POST",
      body: formData,
      headers: {
        ...headers,
        // Не устанавливаем Content-Type для FormData
      },
    });
  }
}

// Создаем единственный экземпляр клиента
export const httpClient = new HttpClient();

// Экспортируем удобные функции для использования
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    httpClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    httpClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    httpClient.put<T>(endpoint, data, options),
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    httpClient.patch<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    httpClient.delete<T>(endpoint, options),
  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    httpClient.upload<T>(endpoint, formData, options),
};
