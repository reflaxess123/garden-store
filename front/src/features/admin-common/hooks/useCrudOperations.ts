"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CrudOperationsConfig<T, CreateData, UpdateData> {
  // Ключи для инвалидации запросов
  queryKeys: {
    list: string[]; // Ключ для списка записей
    detail?: (id: string) => string[]; // Ключ для детальной записи
  };

  // API функции
  api: {
    create: (data: CreateData) => Promise<T>;
    update: (id: string, data: UpdateData) => Promise<T>;
    delete: (id: string) => Promise<void>;
  };

  // Сообщения об успехе
  messages?: {
    create?: string;
    update?: string;
    delete?: string;
  };

  // Обработчики событий
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: () => void;
  };
}

export function useCrudOperations<T, CreateData = any, UpdateData = any>({
  queryKeys,
  api,
  messages = {},
  onSuccess = {},
}: CrudOperationsConfig<T, CreateData, UpdateData>) {
  const queryClient = useQueryClient();

  // Мутация для создания
  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list });
      toast.success(messages.create || "Запись успешно создана!");
      onSuccess.create?.(data);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Ошибка при создании записи";
      toast.error(errorMessage);
    },
  });

  // Мутация для обновления
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateData }) =>
      api.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list });
      if (queryKeys.detail) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.detail(variables.id),
        });
      }
      toast.success(messages.update || "Запись успешно обновлена!");
      onSuccess.update?.(data);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Ошибка при обновлении записи";
      toast.error(errorMessage);
    },
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list });
      if (queryKeys.detail) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.detail(deletedId),
        });
      }
      toast.success(messages.delete || "Запись успешно удалена!");
      onSuccess.delete?.();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        "Ошибка при удалении записи";
      toast.error(errorMessage);
    },
  });

  // Универсальные функции для вызова
  const create = (data: CreateData) => {
    createMutation.mutate(data);
  };

  const update = (id: string, data: UpdateData) => {
    updateMutation.mutate({ id, data });
  };

  const deleteItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  return {
    // Мутации
    createMutation,
    updateMutation,
    deleteMutation,

    // Функции
    create,
    update,
    delete: deleteItem,

    // Состояния загрузки
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
