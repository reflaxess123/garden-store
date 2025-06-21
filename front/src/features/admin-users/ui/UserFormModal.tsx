"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AdminUser,
  createAdminUser,
  CreateUserPayload,
  updateAdminUser,
  UpdateUserPayload,
} from "@/entities/user/admin-api";
import { useCrudOperations } from "@/features/admin-common/hooks";
import CrudFormModal from "@/features/admin-common/ui/CrudFormModal";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

// Zod schema for user form validation
const userFormSchema = z.object({
  email: z.string().email("Введите корректный email."),
  password: z
    .string()
    .min(6, "Пароль должен быть не менее 6 символов.")
    .optional(),
  fullName: z.string().optional().or(z.literal("")),
  isAdmin: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export interface UserFormModalProps {
  user?: AdminUser | null;
  trigger: ReactNode;
  onSuccess?: () => void;
}

export default function UserFormModal({
  user,
  trigger,
  onSuccess,
}: UserFormModalProps) {
  const isEdit = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
      fullName: user?.fullName || "",
      isAdmin: user?.isAdmin || false,
    },
  });

  const { create, update, isLoading } = useCrudOperations<
    AdminUser,
    CreateUserPayload,
    UpdateUserPayload
  >({
    queryKeys: {
      list: ["adminUsers"],
    },
    api: {
      create: createAdminUser,
      update: updateAdminUser,
      delete: () => Promise.resolve(), // Не используется в этом компоненте
    },
    messages: {
      create: "Пользователь успешно создан!",
      update: "Пользователь успешно обновлен!",
    },
    onSuccess: {
      create: () => {
        form.reset();
        onSuccess?.();
      },
      update: () => {
        onSuccess?.();
      },
    },
  });

  const onSubmit = (values: UserFormValues) => {
    if (isEdit && user) {
      const updateData: UpdateUserPayload = {
        email: values.email,
        fullName: values.fullName || undefined,
        isAdmin: values.isAdmin,
      };
      update(user.id, updateData);
    } else {
      if (!values.password) {
        form.setError("password", {
          message: "Пароль обязателен для нового пользователя",
        });
        return;
      }
      const createData: CreateUserPayload = {
        email: values.email,
        password: values.password,
        fullName: values.fullName || undefined,
        isAdmin: values.isAdmin,
      };
      create(createData);
    }
  };

  const handleFormSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <CrudFormModal
      item={user}
      trigger={trigger}
      title={isEdit ? "Редактировать пользователя" : "Создать пользователя"}
      onSubmit={handleFormSubmit}
      onClose={() => {}}
      loading={isLoading}
      size="md"
    >
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEdit && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Минимум 6 символов"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Полное имя</FormLabel>
                <FormControl>
                  <Input placeholder="Иван Иванов" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAdmin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Права администратора</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Пользователь получит доступ к административной панели
                  </p>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CrudFormModal>
  );
}
