import { useCallback, useState } from "react";
import { logger } from "../lib/logger";
import { AsyncState, OperationState, OperationStatus } from "../types/common";

// Хук для простого асинхронного состояния
export function useAsyncState<T>(
  initialData: T | null = null
): AsyncState<T> & {
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
} {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    setData,
    setLoading,
    setError,
    reset,
  };
}

// Хук для операций с более детальным состоянием
export function useOperationState(): OperationState & {
  setStatus: (status: OperationStatus) => void;
  setError: (error: string) => void;
  setMessage: (message: string) => void;
  setSuccess: (message?: string) => void;
  setLoading: () => void;
  reset: () => void;
} {
  const [status, setStatus] = useState<OperationStatus>(OperationStatus.IDLE);
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();

  const setSuccess = useCallback((successMessage?: string) => {
    setStatus(OperationStatus.SUCCESS);
    setError(undefined);
    setMessage(successMessage);
  }, []);

  const setLoading = useCallback(() => {
    setStatus(OperationStatus.LOADING);
    setError(undefined);
    setMessage(undefined);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setStatus(OperationStatus.ERROR);
    setError(errorMessage);
    setMessage(undefined);
  }, []);

  const handleMessage = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const reset = useCallback(() => {
    setStatus(OperationStatus.IDLE);
    setError(undefined);
    setMessage(undefined);
  }, []);

  return {
    status,
    error,
    message,
    setStatus,
    setError: handleError,
    setMessage: handleMessage,
    setSuccess,
    setLoading,
    reset,
  };
}

// Хук для выполнения асинхронных операций
export function useAsyncOperation<T, P extends any[] = []>(
  operation: (...args: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    logContext?: { component?: string; action?: string };
  }
) {
  const asyncState = useAsyncState<T>();
  const operationState = useOperationState();

  const execute = useCallback(
    async (...args: P) => {
      try {
        asyncState.setLoading(true);
        asyncState.setError(null);
        operationState.setLoading();

        const result = await operation(...args);

        asyncState.setData(result);
        asyncState.setLoading(false);
        operationState.setSuccess();

        options?.onSuccess?.(result);

        if (options?.logContext) {
          logger.info("Operation completed successfully", options.logContext);
        }

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Произошла ошибка";

        asyncState.setError(errorMessage);
        asyncState.setLoading(false);
        operationState.setError(errorMessage);

        options?.onError?.(error);

        if (options?.logContext) {
          logger.error("Operation failed", error, options.logContext);
        }

        throw error;
      }
    },
    [operation, options, asyncState, operationState]
  );

  const reset = useCallback(() => {
    asyncState.reset();
    operationState.reset();
  }, [asyncState, operationState]);

  return {
    ...asyncState,
    ...operationState,
    execute,
    reset,
    isIdle: operationState.status === OperationStatus.IDLE,
    isSuccess: operationState.status === OperationStatus.SUCCESS,
  };
}

// Хук для работы с массивами данных (списки)
export function useAsyncList<T>(initialData: T[] = []) {
  const [items, setItems] = useState<T[]>(initialData);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
    setTotal((prev) => prev + 1);
  }, []);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => !predicate(item));
      setTotal(filtered.length);
      return filtered;
    });
  }, []);

  const updateItem = useCallback(
    (predicate: (item: T) => boolean, updater: (item: T) => T) => {
      setItems((prev) =>
        prev.map((item) => (predicate(item) ? updater(item) : item))
      );
    },
    []
  );

  const replaceItems = useCallback((newItems: T[], newTotal?: number) => {
    setItems(newItems);
    setTotal(newTotal ?? newItems.length);
  }, []);

  const appendItems = useCallback(
    (newItems: T[], newTotal?: number, hasMoreItems = true) => {
      setItems((prev) => [...prev, ...newItems]);
      if (newTotal !== undefined) {
        setTotal(newTotal);
      }
      setHasMore(hasMoreItems);
    },
    []
  );

  const reset = useCallback(() => {
    setItems(initialData);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setTotal(0);
  }, [initialData]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    total,
    setLoading,
    setError,
    setHasMore,
    addItem,
    removeItem,
    updateItem,
    replaceItems,
    appendItems,
    reset,
  };
}
