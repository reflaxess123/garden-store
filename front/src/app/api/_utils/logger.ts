/**
 * Server-side logging utility для API routes
 */

interface LogContext {
  endpoint?: string;
  method?: string;
  status?: number;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level: "ERROR",
    message,
    error: error instanceof Error ? error.message : error,
    context,
  };

  // В продакшене можно отправлять в внешний сервис логирования (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === "development") {
    console.error(
      `[${timestamp}] API ERROR: ${message}`,
      error || "",
      context || ""
    );
  } else {
    // В продакшене логируем только структурированные данные
    console.error(JSON.stringify(logData));
  }
}

export function logInfo(message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level: "INFO",
    message,
    context,
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[${timestamp}] API INFO: ${message}`, context || "");
  } else {
    console.log(JSON.stringify(logData));
  }
}

export function logWarning(message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level: "WARNING",
    message,
    context,
  };

  if (process.env.NODE_ENV === "development") {
    console.warn(`[${timestamp}] API WARNING: ${message}`, context || "");
  } else {
    console.warn(JSON.stringify(logData));
  }
}

/**
 * Обработчик ошибок для API routes
 */
export function handleApiError(error: unknown, context?: LogContext) {
  if (error instanceof Error) {
    logError(error.message, error, context);
    return {
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      status: 500,
    };
  }

  logError("Unknown error occurred", error, context);
  return {
    error: "Internal server error",
    status: 500,
  };
}

/**
 * Middleware для логирования API запросов
 */
export function logApiRequest(
  method: string,
  endpoint: string,
  context?: LogContext
) {
  logInfo(`${method} ${endpoint}`, {
    method,
    endpoint,
    ...context,
  });
}
