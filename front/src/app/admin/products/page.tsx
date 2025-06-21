"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Pencil, Trash, TrendingUp } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import {
  useCrudOperations,
  usePaginatedList,
} from "@/features/admin-common/hooks";
import {
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  DeleteConfirmDialog,
  StatsCard,
  StatsGrid,
} from "@/features/admin-common/ui";
import { ProductFormModalWrapper as ProductFormModal } from "@/features/admin-products/ui";

import {
  AdminCategory,
  getAdminCategories,
} from "@/entities/category/admin-api";
import {
  AdminProductClient,
  deleteAdminProduct,
  getAdminProducts,
} from "@/entities/product/admin-api";
import { formatPrice } from "@/shared";

// Локальный тип с индексной сигнатурой для совместимости
type ProductWithIndex = AdminProductClient & Record<string, unknown>;

export default function AdminProductsPage() {
  // Загрузка данных
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  const { data: categories = [] } = useQuery<AdminCategory[]>({
    queryKey: ["adminCategories"],
    queryFn: getAdminCategories,
  });

  // Пагинация и фильтрация
  const {
    data: paginatedProducts,
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    filters,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    isEmpty,
  } = usePaginatedList<ProductWithIndex>(
    (products as ProductWithIndex[]) || [],
    {
      itemsPerPage: 20,
      searchFields: ["name", "description"],
    }
  );

  // CRUD операции
  const { delete: deleteProduct, isDeleting } =
    useCrudOperations<AdminProductClient>({
      queryKeys: {
        list: ["adminProducts"],
      },
      api: {
        create: () => Promise.resolve({} as AdminProductClient), // Не используется
        update: () => Promise.resolve({} as AdminProductClient), // Не используется
        delete: deleteAdminProduct,
      },
      messages: {
        delete: "Продукт успешно удален!",
      },
    });

  const handleSuccess = () => {
    refetch();
  };

  // Статистика
  const statsCards: StatsCard[] = [
    {
      title: "Всего продуктов",
      value: products.length,
      icon: Package,
    },
    {
      title: "В наличии",
      value: products.filter((p) => p.timesOrdered && p.timesOrdered > 0)
        .length,
      icon: TrendingUp,
      description: "Заказывались",
    },
    {
      title: "Средняя цена",
      value:
        products.length > 0
          ? `₽${Math.round(
              products.reduce((sum, p) => sum + parseFloat(p.price), 0) /
                products.length
            )}`
          : "₽0",
      icon: TrendingUp,
    },
    {
      title: "Без категории",
      value: products.filter((p) => !p.category).length,
      icon: Package,
      description: "Требуют категорию",
    },
  ];

  // Фильтры
  const productFilters = [
    {
      value: filters.categoryId || "",
      onChange: (value: string) => handleFilterChange("categoryId", value),
      options: [
        { value: "", label: "Все категории" },
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
      ],
      placeholder: "Выберите категорию",
      label: "Категория",
    },
  ];

  if (isProductsError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Ошибка загрузки продуктов
          </h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Неизвестная ошибка"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Заголовок */}
      <AdminPageHeader
        title="Управление продуктами"
        description="Создавайте и редактируйте продукты каталога"
        actions={
          <ProductFormModal
            trigger={<Button>Добавить продукт</Button>}
            onSuccess={handleSuccess}
          />
        }
      />

      {/* Статистика */}
      <StatsGrid cards={statsCards} loading={isLoadingProducts} />

      {/* Фильтры */}
      <AdminFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={productFilters}
        onClearFilters={clearFilters}
      />

      {/* Таблица продуктов */}
      <Card>
        <CardHeader>
          <CardTitle>Продукты ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Продукты не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Фото</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Заказов</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 relative rounded-md overflow-hidden">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                              Нет фото
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category?.name || "Без категории"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPrice(parseFloat(product.price))}
                      </TableCell>
                      <TableCell>{product.timesOrdered || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ProductFormModal
                            product={product}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                            onSuccess={handleSuccess}
                          />
                          <DeleteConfirmDialog
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            }
                            itemName={product.name}
                            onConfirm={() => deleteProduct(product.id)}
                            loading={isDeleting}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}
