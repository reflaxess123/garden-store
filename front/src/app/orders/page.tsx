"use client";

import { useAuth } from "@/features/auth/AuthContext";
import {
  OrderInDB,
  useDeleteorderapiordersdelete,
  useGetuserordersapiordersget,
} from "@/shared/api/generated";
import { formatPrice } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  Filter,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// Функция для получения цвета бейджа по статусу
const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
    case "ожидает":
      return "default";
    case "processing":
    case "обработка":
      return "secondary";
    case "shipped":
    case "доставляется":
      return "outline";
    case "delivered":
    case "доставлен":
      return "default";
    case "cancelled":
    case "отменен":
      return "destructive";
    default:
      return "outline";
  }
};

// Функция для получения иконки статуса
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
    case "ожидает":
      return <Clock className="h-4 w-4" />;
    case "processing":
    case "обработка":
      return <RefreshCw className="h-4 w-4" />;
    case "shipped":
    case "доставляется":
      return <Package className="h-4 w-4" />;
    case "delivered":
    case "доставлен":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
    case "отменен":
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

// Функция для получения читаемого статуса
const getReadableStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Ожидает";
    case "processing":
      return "Обработка";
    case "shipped":
      return "Доставляется";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменен";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
  } = useGetuserordersapiordersget({
    enabled: isAuthenticated,
  });

  const deleteOrderMutation = useDeleteorderapiordersdelete();

  // Фильтрация и сортировка заказов
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    const filtered = orders.filter((order: OrderInDB) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Сортировка
    filtered.sort((a: OrderInDB, b: OrderInDB) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-desc":
          return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
        case "amount-asc":
          return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, sortBy]);

  // Статистика заказов
  const orderStats = useMemo(() => {
    if (!orders) return { total: 0, totalAmount: 0, statusCounts: {} };

    const statusCounts = orders.reduce((acc: any, order: OrderInDB) => {
      const status = getReadableStatus(order.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalAmount = orders.reduce((sum: number, order: OrderInDB) => {
      return sum + parseFloat(order.totalAmount);
    }, 0);

    return {
      total: orders.length,
      totalAmount,
      statusCounts,
    };
  }, [orders]);

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      // Оптимистично удаляем заказ из UI
      queryClient.setQueryData(
        ["getUserOrdersApiOrdersGet"],
        (old: OrderInDB[] | undefined) => {
          if (!old) return [];
          return old.filter((order) => order.id !== orderToDelete);
        }
      );

      await deleteOrderMutation.mutateAsync({
        orderId: orderToDelete,
      });

      toast.success("Заказ успешно удалён!");

      // Инвалидируем кэш для обновления данных
      queryClient.invalidateQueries({
        queryKey: ["getUserOrdersApiOrdersGet"],
      });
    } catch (error) {
      toast.error("Ошибка при удалении заказа");

      // Откатываем оптимистичное обновление при ошибке
      queryClient.invalidateQueries({
        queryKey: ["getUserOrdersApiOrdersGet"],
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const openDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 md:p-8">
          {/* Заголовок с загрузкой */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          {/* Статистика с загрузкой */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Карточки заказов с загрузкой */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Требуется авторизация
          </h1>
          <p className="text-muted-foreground mb-6">
            Пожалуйста, войдите в систему, чтобы просмотреть свои заказы
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Войти в систему
          </Button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Ошибка загрузки
          </h1>
          <p className="text-muted-foreground mb-6">
            Не удалось загрузить заказы. Пожалуйста, попробуйте еще раз
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить страницу
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Мои заказы
          </h1>
          <p className="text-lg text-muted-foreground">
            Управляйте своими заказами и отслеживайте статус доставки
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm font-medium">
                    Всего заказов
                  </p>
                  <p className="text-3xl font-bold">{orderStats.total}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary-foreground/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500 dark:bg-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    Общая сумма
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(orderStats.totalAmount)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-white/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-violet-500 dark:bg-violet-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    Доставлено
                  </p>
                  <p className="text-3xl font-bold">
                    {orderStats.statusCounts["Доставлен"] || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-white/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500 dark:bg-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    В обработке
                  </p>
                  <p className="text-3xl font-bold">
                    {(orderStats.statusCounts["Ожидает"] || 0) +
                      (orderStats.statusCounts["Обработка"] || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-white/70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Фильтры и поиск */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск по номеру заказа, имени или email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="pending">Ожидает</SelectItem>
                    <SelectItem value="processing">Обработка</SelectItem>
                    <SelectItem value="shipped">Доставляется</SelectItem>
                    <SelectItem value="delivered">Доставлен</SelectItem>
                    <SelectItem value="cancelled">Отменен</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Сначала новые</SelectItem>
                    <SelectItem value="date-asc">Сначала старые</SelectItem>
                    <SelectItem value="amount-desc">
                      По убыванию суммы
                    </SelectItem>
                    <SelectItem value="amount-asc">
                      По возрастанию суммы
                    </SelectItem>
                    <SelectItem value="status">По статусу</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Результаты */}
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Заказов пока нет
            </h2>
            <p className="text-muted-foreground mb-6">
              Когда вы сделаете первый заказ, он появится здесь
            </p>
            <Button
              onClick={() => (window.location.href = "/catalog")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Перейти в каталог
            </Button>
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Ничего не найдено
            </h2>
            <p className="text-muted-foreground mb-6">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("date-desc");
              }}
              variant="outline"
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedOrders.map((order: OrderInDB) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full p-2">
                        <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Заказ #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "ru-RU",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(order.status)}
                        {getReadableStatus(order.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(parseFloat(order.totalAmount))}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Информация о доставке */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Информация о доставке
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Получатель:</span>
                          {order.fullName}
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {order.email}
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {order.phone}
                        </p>
                        <p className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>
                            {order.address}, {order.city}, {order.postalCode}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Товары в заказе */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Товары в заказе ({order.orderItems?.length || 0})
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {order.orderItems?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-12 w-12 object-cover rounded-lg border border-border"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-muted/50 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} ×{" "}
                                {formatPrice(parseFloat(item.priceSnapshot))}
                              </p>
                            </div>
                            <p className="font-semibold text-foreground">
                              {formatPrice(
                                parseFloat(item.priceSnapshot) * item.quantity
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Подробнее
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Скачать чек
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(order.id)}
                      disabled={deleteOrderMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteOrderMutation.isPending
                        ? "Удаление..."
                        : "Удалить заказ"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Диалог удаления */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Удалить заказ
              </DialogTitle>
              <DialogDescription>
                Вы уверены, что хотите удалить этот заказ? Это действие нельзя
                отменить. Все данные о заказе будут безвозвратно удалены.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteOrder}
                disabled={deleteOrderMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteOrderMutation.isPending ? "Удаление..." : "Удалить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
