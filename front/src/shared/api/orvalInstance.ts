import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Базовый URL API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Создаем экземпляр Axios
const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Для работы с cookies
  timeout: 10000, // 10 секунд
});

// Интерцептор для обработки токенов
axiosInstance.interceptors.request.use(
  (config) => {
    // Здесь можно добавить логику для токенов
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка ошибок авторизации
    if (error.response?.status === 401) {
      // Логика для обновления токена или редиректа на логин
      console.warn("Unauthorized access - redirecting to login");
    }
    return Promise.reject(error);
  }
);

// Кастомный экземпляр для Orval
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => data);

  // Добавляем возможность отмены запроса
  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

// Дефолтный экспорт
export default customInstance;

// Экспорт типов для использования в других файлах
export type { AxiosRequestConfig, AxiosResponse };
