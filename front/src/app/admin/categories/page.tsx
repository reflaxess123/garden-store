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
import { generateSlug } from "@/shared/lib/utils";
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
  imageUrl: z.string().optional().or(z.literal("")),
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
    const slug = generateSlug(values.name);

    if (category) {
      updateMutate({
        id: category.id,
        payload: {
          name: values.name,
          slug: slug,
          imageUrl: values.imageUrl || null,
        },
      });
    } else {
      createMutate({
        name: values.name,
        slug: slug,
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
    data: categories,
    isLoading,
    isError,
  } = useQuery<AdminCategory[]>({
    queryKey: ["adminCategories"],
    queryFn: getAdminCategories,
  });

  const handleSuccess = () => {
    // No specific action needed here beyond invalidating queries handled by mutations
  };

  if (isLoading) {
    return <p>Загрузка категорий...</p>;
  }

  if (isError) {
    return <p className="text-red-500">Ошибка загрузки категорий.</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Управление категориями</h1>
      <div className="flex justify-end mb-4">
        <CategoryFormDialog onSuccess={handleSuccess}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Создать категорию
          </Button>
        </CategoryFormDialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Изображение</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {category.slug}
                </TableCell>
                <TableCell>
                  {category.imageUrl && (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                  )}
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Нет категорий.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
