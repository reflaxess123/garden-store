"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AdminCategory,
  createAdminCategory,
  CreateCategoryPayload,
  updateAdminCategory,
  UpdateCategoryPayload,
} from "@/entities/category/admin-api";
import { useCrudOperations } from "@/features/admin-common/hooks";
import CrudFormModal from "@/features/admin-common/ui/CrudFormModal";
import { generateSlug } from "@/shared";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

// Zod schema for category form validation
const categoryFormSchema = z.object({
  name: z.string().min(1, "Имя категории обязательно."),
  imageUrl: z.string().optional().or(z.literal("")),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export interface CategoryFormModalProps {
  category?: AdminCategory | null;
  trigger: ReactNode;
  onSuccess?: () => void;
}

export default function CategoryFormModal({
  category,
  trigger,
  onSuccess,
}: CategoryFormModalProps) {
  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      imageUrl: category?.imageUrl || "",
    },
  });

  const { create, update, isLoading } = useCrudOperations<
    AdminCategory,
    CreateCategoryPayload,
    UpdateCategoryPayload
  >({
    queryKeys: {
      list: ["adminCategories"],
    },
    api: {
      create: createAdminCategory,
      update: updateAdminCategory,
      delete: () => Promise.resolve(), // Не используется в этом компоненте
    },
    messages: {
      create: "Категория успешно создана!",
      update: "Категория успешно обновлена!",
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

  const onSubmit = (values: CategoryFormValues) => {
    const slug = generateSlug(values.name);
    const payload = {
      name: values.name,
      slug: slug,
      imageUrl: values.imageUrl || null,
    };

    if (isEdit && category) {
      update(category.id, payload);
    } else {
      create(payload);
    }
  };

  const handleFormSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <CrudFormModal
      item={category}
      trigger={trigger}
      title={isEdit ? "Редактировать категорию" : "Создать категорию"}
      onSubmit={handleFormSubmit}
      onClose={() => {}}
      loading={isLoading}
      size="md"
    >
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Название категории" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL изображения</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CrudFormModal>
  );
}
