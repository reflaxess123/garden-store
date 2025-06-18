"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AdminCategory,
  createAdminCategory,
  CreateCategoryPayload,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  UpdateCategoryPayload,
} from "@/entities/category/admin-api";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import Image from "next/image";

// Zod schema for category form validation
const categoryFormSchema = z.object({
  name: z.string().min(1, "Имя категории обязательно."),
  slug: z.string().min(1, "Slug категории обязателен."),
  imageUrl: z
    .string()
    .url("Неверный формат URL изображения.")
    .optional()
    .or(z.literal("")),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormDialogProps {
  category?: AdminCategory; // Optional for editing
  onSuccess: () => void;
  children: React.ReactNode; // Trigger button
}

function CategoryFormDialog({
  category,
  onSuccess,
  children,
}: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      imageUrl: category?.imageUrl || "",
    },
  });

  const {
    mutate: createMutate,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (data: CreateCategoryPayload) => createAdminCategory(data),
    onSuccess: () => {
      toast.success("Категория успешно создана!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при создании категории: ${error.message}`);
    },
  });

  const {
    mutate: updateMutate,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: (data: { id: string; payload: UpdateCategoryPayload }) =>
      updateAdminCategory(data.id, data.payload),
    onSuccess: () => {
      toast.success("Категория успешно обновлена!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении категории: ${error.message}`);
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (category) {
      updateMutate({
        id: category.id,
        payload: {
          name: values.name,
          slug: values.slug,
          imageUrl: values.imageUrl || null,
        },
      });
    } else {
      createMutate({
        name: values.name,
        slug: values.slug,
        imageUrl: values.imageUrl || null,
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Редактировать" : "Создать"} категорию
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Внесите изменения в категорию."
              : "Создайте новую категорию."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug-категории" {...field} />
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
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? "Сохранить изменения" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCategoryDialogProps {
  categoryId: string;
  onSuccess: () => void;
  children: React.ReactNode; // Trigger button
}

function DeleteCategoryDialog({
  categoryId,
  onSuccess,
  children,
}: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => {
      toast.success("Категория успешно удалена!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении категории: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вы уверены?</DialogTitle>
          <DialogDescription>
            Это действие невозможно отменить. Категория будет удалена
            безвозвратно.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutate(categoryId)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<AdminCategory[]>({
    queryKey: ["adminCategories"],
    queryFn: getAdminCategories,
  });

  const handleSuccess = () => {
    // Optionally refetch or re-validate if needed, useQueryClient.invalidateQueries handles this
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Загрузка категорий...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 min-h-[calc(100vh-140px)] flex items-center justify-center">
        Ошибка загрузки категорий: {error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление категориями</h1>
        <CategoryFormDialog onSuccess={handleSuccess}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить категорию
          </Button>
        </CategoryFormDialog>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Нет доступных категорий. Создайте первую!
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Изображение</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Создана</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-[60px] w-[60px] flex items-center justify-center bg-muted rounded-md text-muted-foreground text-xs">
                        Нет изо.
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <CategoryFormDialog
                        category={category}
                        onSuccess={handleSuccess}
                      >
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </CategoryFormDialog>
                      <DeleteCategoryDialog
                        categoryId={category.id}
                        onSuccess={handleSuccess}
                      >
                        <Button variant="destructive" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DeleteCategoryDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
