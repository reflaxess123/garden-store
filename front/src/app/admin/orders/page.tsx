"use client";

import { formatPrice } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
  // status: string;
  // userId: string;
  // order_items: OrderItem[];
}

interface Order {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  totalAmount: number;
  status: string;
  userId: string;
  orderItems: OrderItem[];
}

// Компонент фильтров для заказов
interface OrderFiltersProps {
  searchQuery: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

function OrderFilters({
  searchQuery,
  statusFilter,
  sortBy,
  sortOrder,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: OrderFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    sortBy !== "default" ||
    dateFrom ||
    dateTo;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Поиск */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Поиск</label>
            <Input
              placeholder="Найти заказ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Статус */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Статус</label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">В ожидании</SelectItem>
                <SelectItem value="processing">В обработке</SelectItem>
                <SelectItem value="shipped">Отправлен</SelectItem>
                <SelectItem value="delivered">Доставлен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Дата от */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Дата от</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>

          {/* Дата до */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Дата до</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>

          {/* Сортировка */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Сортировка</label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger>
                <SelectValue placeholder="По умолчанию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">По умолчанию</SelectItem>
                <SelectItem value="createdAt">По дате</SelectItem>
                <SelectItem value="totalAmount">По сумме</SelectItem>
                <SelectItem value="fullName">По имени</SelectItem>
                <SelectItem value="status">По статусу</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Порядок сортировки */}
          {sortBy !== "default" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Порядок</label>
              <Select value={sortOrder} onValueChange={onSortOrderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">По возрастанию</SelectItem>
                  <SelectItem value="desc">По убыванию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Активные фильтры */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Активные фильтры:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Поиск: &quot;{searchQuery}&quot;
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onSearchChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Статус: {statusFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onStatusChange("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  От: {dateFrom}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onDateFromChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  До: {dateTo}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onDateToChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Компонент аналитики заказов
interface OrderAnalyticsModalProps {
  orders: Order[];
  isLoading: boolean;
}

function OrderAnalyticsModal({ orders, isLoading }: OrderAnalyticsModalProps) {
  const [open, setOpen] = useState(false);

  const analyticsData = useMemo(() => {
    if (!orders.length) return null;

    // Статистика по статусам
    const statusStats = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Статистика по дням
    const dailyStats = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += order.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Топ клиенты
    const customerStats = orders.reduce((acc, order) => {
      if (!acc[order.fullName]) {
        acc[order.fullName] = { count: 0, revenue: 0, email: order.email };
      }
      acc[order.fullName].count += 1;
      acc[order.fullName].revenue += order.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; email: string }>);

    const topCustomers = Object.entries(customerStats)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 10);

    // Общая статистика
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const avgOrderValue = totalRevenue / orders.length;
    const totalOrders = orders.length;

    return {
      statusStats,
      dailyStats,
      topCustomers,
      totalRevenue,
      avgOrderValue,
      totalOrders,
    };
  }, [orders]);

  const statusLabels = {
    pending: "В ожидании",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Аналитика заказов
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl sm:max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Аналитика заказов
          </DialogTitle>
          <DialogDescription>
            Статистика заказов, клиентов и выручки
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Загрузка данных...</span>
          </div>
        ) : analyticsData ? (
          <div className="space-y-6">
            {/* Сводная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-700">
                    {analyticsData.totalOrders}
                  </div>
                  <p className="text-sm text-blue-600 font-medium">
                    Всего заказов
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-700">
                    {formatPrice(analyticsData.totalRevenue)}
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Общая выручка
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-700">
                    {formatPrice(analyticsData.avgOrderValue)}
                  </div>
                  <p className="text-sm text-purple-600 font-medium">
                    Средний чек
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-700">
                    {Object.keys(analyticsData.statusStats).length}
                  </div>
                  <p className="text-sm text-orange-600 font-medium">
                    Статусов
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* График по статусам */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Заказы по статусам</h3>
              <div className="space-y-2">
                {Object.entries(analyticsData.statusStats).map(
                  ([status, count]) => {
                    const maxCount = Math.max(
                      ...Object.values(analyticsData.statusStats)
                    );
                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">
                          {statusLabels[status as keyof typeof statusLabels] ||
                            status}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div
                            className="bg-primary h-8 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3 shadow-sm"
                            style={{
                              width: `${Math.max(
                                (count / maxCount) * 100,
                                8
                              )}%`,
                              minWidth: "40px",
                            }}
                          >
                            <span className="text-sm text-primary-foreground font-semibold">
                              {count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Топ клиенты */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Топ клиенты</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Рейтинг</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Заказов</TableHead>
                      <TableHead className="text-right">Потрачено</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.topCustomers.map(([name, stats], index) => (
                      <TableRow key={name}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{stats.email}</TableCell>
                        <TableCell className="text-right font-medium">
                          {stats.count}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatPrice(stats.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Нет данных для анализа
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Компонент пагинации (переиспользуем из продуктов)
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
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Показано {startItem}-{endItem} из {totalItems}
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>на странице</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Состояние фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Состояние пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch orders");
        }
        const data = await res.json();
        setOrders(data);
      } catch (err: unknown) {
        console.error("Error fetching admin orders:", err);
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить заказы."
        );
        toast.error(
          err instanceof Error ? err.message : "Не удалось загрузить заказы."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order status");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Статус заказа успешно обновлен!");
    } catch (err: unknown) {
      console.error("Error updating order status:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Не удалось обновить статус заказа."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Фильтрация и сортировка заказов
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      // Поиск по ID заказа, имени клиента, email или телефону
      const matchesSearch =
        !searchQuery ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.toLowerCase().includes(searchQuery.toLowerCase());

      // Фильтр по статусу
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      // Фильтр по дате
      const orderDate = new Date(order.createdAt);
      const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchesDateTo =
        !dateTo || orderDate <= new Date(dateTo + "T23:59:59");

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // Сортировка
    if (sortBy !== "default") {
      filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Order];
        let bValue: any = b[sortBy as keyof Order];

        if (sortBy === "createdAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (sortBy === "totalAmount") {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, sortBy, sortOrder, dateFrom, dateTo]);

  // Пагинация
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Автоматический сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    itemsPerPage,
  ]);

  // Обработчики фильтров
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("default");
    setSortOrder("desc");
    setDateFrom("");
    setDateTo("");
  };

  // Статистика
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const filteredCount = filteredOrders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      filteredCount,
      totalRevenue,
      avgOrderValue,
    };
  }, [orders, filteredOrders]);

  if (loading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
        <p>Загрузка заказов...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
        <p className="text-destructive">Ошибка: {error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Управление заказами</h1>
        <div className="flex flex-wrap gap-2">
          <OrderAnalyticsModal orders={orders} isLoading={loading} />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalOrders}
            </div>
            <p className="text-sm text-muted-foreground">Всего заказов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.filteredCount}
            </div>
            <p className="text-sm text-muted-foreground">После фильтрации</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-sm text-muted-foreground">Общая выручка</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatPrice(stats.avgOrderValue)}
            </div>
            <p className="text-sm text-muted-foreground">Средний чек</p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <OrderFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearFilters={handleClearFilters}
      />

      {/* Пагинация сверху */}
      {filteredOrders.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredOrders.length}
            />
          </CardContent>
        </Card>
      )}

      {/* Заказы */}
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Заказов пока нет.</p>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Заказы не найдены. Попробуйте изменить фильтры.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {paginatedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  Заказ #{order.id.slice(0, 8)}
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "default"
                        : order.status === "cancelled"
                        ? "destructive"
                        : order.status === "processing"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.status === "pending" && "В ожидании"}
                    {order.status === "processing" && "В обработке"}
                    {order.status === "shipped" && "Отправлен"}
                    {order.status === "delivered" && "Доставлен"}
                    {order.status === "cancelled" && "Отменен"}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(newStatus) =>
                      handleStatusChange(order.id, newStatus)
                    }
                    value={order.status}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Изменить статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">В ожидании</SelectItem>
                      <SelectItem value="processing">В обработке</SelectItem>
                      <SelectItem value="shipped">Отправлен</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                      <SelectItem value="cancelled">Отменен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Пользователь:</strong> {order.fullName} (
                      {order.email})
                    </p>
                    <p>
                      <strong>ID пользователя:</strong> {order.userId}
                    </p>
                    <p>
                      <strong>Дата:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>
                      <strong>Итого:</strong> {formatPrice(order.totalAmount)}
                    </p>
                    <p>
                      <strong>Телефон:</strong> {order.phone}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Адрес:</strong> {order.address}, {order.city},{" "}
                      {order.postalCode}
                    </p>
                    <h3 className="font-semibold mt-2 mb-1">Товары:</h3>
                    <ul className="space-y-1">
                      {order.orderItems &&
                        order.orderItems.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-10 w-10 object-cover rounded-md"
                              />
                            )}
                            <span>
                              {item.name} x {item.quantity} (
                              {formatPrice(item.priceSnapshot)})
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Пагинация снизу */}
      {filteredOrders.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredOrders.length}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
