export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
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
    error?: any,
    context?: LogContext
  ) {
    const formattedMessage = this.formatMessage(level, message, context);

    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, error || "");
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    // В продакшене можно добавить отправку логов во внешний сервис
    if (
      !this.isDevelopment &&
      (level === LogLevel.ERROR || level === LogLevel.WARN)
    ) {
      this.sendToExternalService(level, message, error, context);
    }
  }

  private sendToExternalService(
    level: LogLevel,
    message: string,
    error?: any,
    context?: LogContext
  ) {
    // Здесь можно добавить интеграцию с Sentry, LogRocket, или другим сервисом
    // Пока оставляем пустым
  }

  error(message: string, error?: any, context?: LogContext) {
    this.log(LogLevel.ERROR, message, error, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  // Специальные методы для часто используемых сценариев
  apiError(endpoint: string, error: any, context?: LogContext) {
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
