"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Shield, ShieldCheck, Trash, User, Users } from "lucide-react";

import {
  AdminUser,
  deleteAdminUser,
  getAdminUsers,
} from "@/entities/user/admin-api";
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
import { UserFormModal } from "@/features/admin-users/ui";
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

export default function AdminUsersPage() {
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  // Пагинация и фильтрация
  const {
    data: paginatedUsers,
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
  } = usePaginatedList(users, {
    itemsPerPage: 25,
    searchFields: ["email", "fullName"],
  });

  // CRUD операции
  const { delete: deleteUser, isDeleting } = useCrudOperations<AdminUser>({
    queryKeys: {
      list: ["adminUsers"],
    },
    api: {
      create: () => Promise.resolve({} as AdminUser), // Не используется
      update: () => Promise.resolve({} as AdminUser), // Не используется
      delete: deleteAdminUser,
    },
    messages: {
      delete: "Пользователь успешно удален!",
    },
  });

  const handleSuccess = () => {
    refetch();
  };

  // Статистика
  const statsCards: StatsCard[] = [
    {
      title: "Всего пользователей",
      value: users.length,
      icon: Users,
    },
    {
      title: "Администраторы",
      value: users.filter((u) => u.isAdmin).length,
      icon: ShieldCheck,
    },
    {
      title: "Обычные пользователи",
      value: users.filter((u) => !u.isAdmin).length,
      icon: User,
    },
    {
      title: "Активные пользователи",
      value: users.filter((u) => u.ordersCount > 0).length,
      icon: User,
      description: "Имеют заказы",
    },
  ];

  // Фильтры для роли пользователя
  const roleFilters = [
    {
      value: filters.isAdmin || "",
      onChange: (value: string) => handleFilterChange("isAdmin", value),
      options: [
        { value: "", label: "Все роли" },
        { value: "true", label: "Администраторы" },
        { value: "false", label: "Пользователи" },
      ],
      placeholder: "Выберите роль",
      label: "Роль",
    },
  ];

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Ошибка загрузки пользователей
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
        title="Управление пользователями"
        description="Создавайте, редактируйте и управляйте пользователями системы"
        actions={
          <UserFormModal
            trigger={<Button>Создать пользователя</Button>}
            onSuccess={handleSuccess}
          />
        }
      />

      {/* Статистика */}
      <StatsGrid cards={statsCards} loading={isLoading} />

      {/* Фильтры */}
      <AdminFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={roleFilters}
        onClearFilters={clearFilters}
      />

      {/* Таблица пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Пользователи не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Заказов</TableHead>
                    <TableHead>Избранных</TableHead>
                    <TableHead>В корзине</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.fullName || (
                          <span className="text-muted-foreground">
                            Не указано
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isAdmin ? "default" : "secondary"}>
                          {user.isAdmin ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Админ
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              Пользователь
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.ordersCount}</TableCell>
                      <TableCell>{user.favoritesCount}</TableCell>
                      <TableCell>{user.cartItemsCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <UserFormModal
                            user={user}
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
                            itemName={user.email}
                            onConfirm={() => deleteUser(user.id)}
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
