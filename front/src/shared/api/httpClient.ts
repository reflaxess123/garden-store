export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

export class HttpClientError extends Error {
  public status: number;
  public error: {
    status: number;
    message: string;
    data?: unknown;
  };

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
    this.error = {
      status,
      message,
      data,
    };
  }
}

// Добавляем алиасы для типов
export type ApiError = HttpClientError;
export type ApiResponse<T = unknown> = HttpResponse<T>;

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  private async makeRequest<T = unknown>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...requestConfig } = config;

    let fullUrl = `${this.baseURL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    try {
      const response = await fetch(fullUrl, {
        ...requestConfig,
        headers: {
          "Content-Type": "application/json",
          ...requestConfig.headers,
        },
      });

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new HttpClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error;
      }
      throw new HttpClientError("Network error", 0, error);
    }
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: "GET" });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.makeRequest<T>(url, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(url, { ...config, method: "DELETE" });
  }

  // Загрузка файлов
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestConfig
  ): Promise<T> {
    const { headers, ...restOptions } = options || {};

    // Убираем Content-Type для FormData, браузер установит его автоматически
    return this.makeRequest<T>(endpoint, {
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
  get: <T>(endpoint: string, options?: RequestConfig) =>
    httpClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: unknown, options?: RequestConfig) =>
    httpClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: unknown, options?: RequestConfig) =>
    httpClient.put<T>(endpoint, data, options),
  patch: <T>(endpoint: string, data?: unknown, options?: RequestConfig) =>
    httpClient.patch<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestConfig) =>
    httpClient.delete<T>(endpoint, options),
  upload: <T>(endpoint: string, formData: FormData, options?: RequestConfig) =>
    httpClient.upload<T>(endpoint, formData, options),
};
