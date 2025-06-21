// Константы для уровней логирования
const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isClient = typeof window !== "undefined";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ) {
    const formattedMessage = this.formatMessage(level, message, context);

    if (this.isDevelopment) {
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(formattedMessage, error || "");
          break;
        case LOG_LEVELS.WARN:
          console.warn(formattedMessage);
          break;
        case LOG_LEVELS.INFO:
          console.info(formattedMessage);
          break;
        case LOG_LEVELS.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    // В продакшене можно добавить отправку логов во внешний сервис
    if (
      !this.isDevelopment &&
      (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN)
    ) {
      this.sendToExternalService(level, message, error, context);
    }
  }

  private sendToExternalService(
    _level: LogLevel,
    _message: string,
    _error?: unknown,
    _context?: LogContext
  ) {
    // Здесь будет интеграция с внешним сервисом логирования
    // Например: Sentry.captureException(error, { extra: context });
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    this.log(LOG_LEVELS.ERROR, message, error, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LOG_LEVELS.WARN, message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LOG_LEVELS.INFO, message, undefined, context);
  }

  debug(message: string, context?: LogContext) {
    this.log(LOG_LEVELS.DEBUG, message, undefined, context);
  }

  // Специальные методы для часто используемых сценариев
  apiError(endpoint: string, error: Error | unknown, context?: LogContext) {
    this.error(`API Error: ${endpoint}`, error, { ...context, endpoint });
  }

  apiSuccess(endpoint: string, context?: LogContext) {
    this.debug(`API Success: ${endpoint}`, { ...context, endpoint });
  }

  userAction(action: string, context?: LogContext) {
    this.info(`User Action: ${action}`, { ...context, action });
  }
}

export const logger = new Logger();
