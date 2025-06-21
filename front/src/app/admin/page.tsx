"use client";

import { formatPrice } from "@/shared";
import {
  useGetadmincategoriesapiadmincategoriesget,
  useGetadminordersapiadminordersget,
  useGetadminproductsapiadminproductsget,
  useGetadminusersapiadminusersget,
} from "@/shared/api/generated/api-client";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  MessageCircle,
  Package,
  Plus,
  ShoppingBag,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function AdminHome() {
  // Получаем данные из API
  const { data: categories, isLoading: categoriesLoading } =
    useGetadmincategoriesapiadmincategoriesget();
  const { data: products, isLoading: productsLoading } =
    useGetadminproductsapiadminproductsget();
  const { data: orders, isLoading: ordersLoading } =
    useGetadminordersapiadminordersget();
  const { data: users, isLoading: usersLoading } =
    useGetadminusersapiadminusersget();

  // Вычисляем статистику
  const stats = useMemo(() => {
    if (!products || !orders || !users || !categories) {
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        adminUsers: 0,
        lowStockProducts: 0,
        recentOrders: [],
        topProducts: [],
      };
    }

    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const pendingOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "pending" ||
        order.status.toLowerCase() === "processing"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status.toLowerCase() === "delivered"
    ).length;
    const adminUsers = users.filter((user) => user.isAdmin).length;
    const lowStockProducts = products.filter(
      (product) => product.timesOrdered < 10
    ).length;

    // Последние 5 заказов
    const recentOrders = orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    // Топ продукты по количеству заказов (примерная логика)
    const productOrderCounts = products.map((product) => ({
      ...product,
      orderCount: orders.filter((order) =>
        order.orderItems?.some((item: any) => item.productId === product.id)
      ).length,
    }));

    const topProducts = productOrderCounts
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalCategories: categories.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      adminUsers,
      lowStockProducts,
      recentOrders,
      topProducts,
    };
  }, [products, orders, users, categories]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "processing":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">Ожидает</Badge>;
      case "processing":
        return <Badge variant="outline">Обработка</Badge>;
      case "delivered":
        return <Badge variant="default">Доставлен</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Отменен</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isLoading =
    categoriesLoading || productsLoading || ordersLoading || usersLoading;

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Обзор админ-панели</h1>
        <p className="text-muted-foreground">
          Полный обзор состояния вашего магазина и управление всеми разделами
        </p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего продуктов
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts > 0 && (
                <span className="text-amber-600">
                  {stats.lowStockProducts} мало на складе
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} в обработке
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего пользователей
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.adminUsers} администраторов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} выполненных заказов
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Управление продуктами
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Добавляйте, редактируйте и управляйте товарами в каталоге
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/admin/products">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/products?action=create">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Управление категориями
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Создавайте и редактируйте категории для организации товаров
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/admin/categories">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/categories?action=create">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Управление заказами
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Просматривайте и управляйте заказами покупателей
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/admin/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Link>
              </Button>
              <Badge variant="outline" className="ml-auto">
                {stats.pendingOrders} новых
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление пользователями
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Создавайте и управляйте пользователями системы
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/admin/users">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/users?action=create">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Чаты поддержки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Отвечайте на вопросы пользователей в чатах поддержки
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/admin/chats">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Аналитика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Просматривайте статистику и аналитику продаж
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/orders?showAnalytics=true">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Аналитика
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Последние заказы и топ продукты */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded flex-1 animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Нет заказов
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-sm font-medium">
                          #{order.id.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(parseFloat(order.totalAmount))}
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/orders">Все заказы</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Популярные продукты</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-1 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Нет данных о продуктах
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.orderCount} заказов •{" "}
                        {formatPrice(parseFloat(product.price))}
                      </p>
                    </div>
                    <Badge variant="outline">{product.timesOrdered} раз</Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/products?showPopular=true">
                  Все продукты
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
