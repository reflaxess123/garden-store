"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash,
  User,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import {
  AdminUser,
  createAdminUser,
  CreateUserPayload,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  UpdateUserPayload,
} from "@/entities/user/admin-api";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";

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

interface UserFormDialogProps {
  user: AdminUser | null; // Optional for editing
  onSuccess: () => void;
  children: React.ReactNode; // Trigger button
}

function UserFormDialog({ user, onSuccess, children }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
      fullName: user?.fullName || "",
      isAdmin: user?.isAdmin || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Пользователь успешно создан!");
      setOpen(false);
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка создания пользователя");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserPayload;
    }) => updateAdminUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Пользователь успешно обновлен!");
      setOpen(false);
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка обновления пользователя");
    },
  });

  const onSubmit = (values: UserFormValues) => {
    if (user) {
      // Editing existing user
      const updateData: UpdateUserPayload = {
        email: values.email,
        fullName: values.fullName || undefined,
        isAdmin: values.isAdmin,
      };
      updateMutation.mutate({ userId: user.id, data: updateData });
    } else {
      // Creating new user
      if (!values.password) {
        toast.error("Пароль обязателен для нового пользователя");
        return;
      }
      const createData: CreateUserPayload = {
        email: values.email,
        password: values.password,
        fullName: values.fullName || undefined,
        isAdmin: values.isAdmin,
      };
      createMutation.mutate(createData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {user
              ? "Редактировать пользователя"
              : "Создать нового пользователя"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Измените информацию о пользователе"
              : "Создайте нового пользователя для системы"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {!user && (
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
                    <FormLabel>Администратор</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Предоставить права администратора
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : user ? (
                  "Обновить"
                ) : (
                  "Создать"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteUserDialogProps {
  userId: string;
  userEmail: string;
  onSuccess: () => void;
  children: React.ReactNode; // Trigger button
}

function DeleteUserDialog({
  userId,
  userEmail,
  onSuccess,
  children,
}: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Пользователь успешно удален!");
      setOpen(false);
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка удаления пользователя");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(userId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить пользователя</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить пользователя{" "}
            <strong>{userEmail}</strong>? Это действие нельзя отменить. Будут
            удалены все связанные данные: заказы, избранное, корзина.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AdminFiltersProps {
  searchQuery: string;
  roleFilter: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onClearFilters: () => void;
}

function AdminFilters({
  searchQuery,
  roleFilter,
  onSearchChange,
  onRoleChange,
  onClearFilters,
}: AdminFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Фильтры
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Поиск по email или имени
          </label>
          <Input
            placeholder="Введите email или имя..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Роль</label>
          <Select value={roleFilter} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Все пользователи" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все пользователи</SelectItem>
              <SelectItem value="admin">Только администраторы</SelectItem>
              <SelectItem value="user">Только пользователи</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={onClearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Очистить фильтры
        </Button>
      </CardContent>
    </Card>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);

    let startPage = Math.max(1, currentPage - halfShow);
    let endPage = Math.min(totalPages, currentPage + halfShow);

    if (endPage - startPage + 1 < showPages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + showPages - 1);
      } else {
        startPage = Math.max(1, endPage - showPages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Показано:</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>из {totalItems}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Вперед
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<AdminUser[]>({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.fullName &&
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && user.isAdmin) ||
        (roleFilter === "user" && !user.isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSuccess = () => {
    // Callback after successful operations
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

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
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Управление пользователями
          </h1>
          <p className="text-muted-foreground mt-2">
            Создавайте, редактируйте и управляйте пользователями системы
          </p>
        </div>

        <UserFormDialog user={null} onSuccess={handleSuccess}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать пользователя
          </Button>
        </UserFormDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего пользователей
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : users?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Администраторы
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : users?.filter((u) => u.isAdmin).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Обычные пользователи
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : users?.filter((u) => !u.isAdmin).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные пользователи
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : users?.filter((u) => u.ordersCount > 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <AdminFilters
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            onSearchChange={handleSearchChange}
            onRoleChange={handleRoleChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Users Table */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Пользователи ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : currentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Пользователи не найдены
                  </p>
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
                      {currentUsers.map((user) => (
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
                            <Badge
                              variant={user.isAdmin ? "default" : "secondary"}
                            >
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
                              <UserFormDialog
                                user={user}
                                onSuccess={handleSuccess}
                              >
                                <Button variant="outline" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </UserFormDialog>

                              <DeleteUserDialog
                                userId={user.id}
                                userEmail={user.email}
                                onSuccess={handleSuccess}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </DeleteUserDialog>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={filteredUsers.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
