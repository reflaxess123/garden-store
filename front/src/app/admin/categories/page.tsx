"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash } from "lucide-react";
import Image from "next/image";

import {
  AdminCategory,
  deleteAdminCategory,
  getAdminCategories,
} from "@/entities/category/admin-api";
import { CategoryFormModal } from "@/features/admin-categories/ui";
import { useCrudOperations } from "@/features/admin-common/hooks";
import {
  AdminPageHeader,
  DeleteConfirmDialog,
} from "@/features/admin-common/ui";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export default function AdminCategoriesPage() {
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminCategory[]>({
    queryKey: ["adminCategories"],
    queryFn: getAdminCategories,
  });

  const { delete: deleteCategory, isDeleting } =
    useCrudOperations<AdminCategory>({
      queryKeys: {
        list: ["adminCategories"],
      },
      api: {
        create: () => Promise.resolve({} as AdminCategory), // Не используется
        update: () => Promise.resolve({} as AdminCategory), // Не используется
        delete: deleteAdminCategory,
      },
      messages: {
        delete: "Категория успешно удалена!",
      },
    });

  const handleSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return <p>Загрузка категорий...</p>;
  }

  if (isError) {
    return <p className="text-red-500">Ошибка загрузки категорий.</p>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <AdminPageHeader
        title="Управление категориями"
        description="Создавайте и редактируйте категории товаров"
        actions={
          <CategoryFormModal
            trigger={<Button>Создать категорию</Button>}
            onSuccess={handleSuccess}
          />
        }
      />

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
                    <CategoryFormModal
                      category={category}
                      trigger={
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      onSuccess={handleSuccess}
                    />
                    <DeleteConfirmDialog
                      trigger={
                        <Button variant="destructive" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      }
                      itemName={category.name}
                      onConfirm={() => deleteCategory(category.id)}
                      loading={isDeleting}
                    />
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
