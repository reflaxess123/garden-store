"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { formatPrice, logger, notifications } from "@/shared";
import {
  OrderInDB,
  useGetuserordersapiordersget,
} from "@/shared/api/generated";
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
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  BarChart3,
  Calendar,
  Edit,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// Интерфейс для данных профиля
interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

// Компонент редактирования профиля
interface EditProfileModalProps {
  user: any;
  onSave: (data: ProfileData) => void;
  isLoading: boolean;
}

function EditProfileModal({ user, onSave, isLoading }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Редактировать профиль
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Редактирование профиля
          </DialogTitle>
          <DialogDescription>Обновите информацию о себе</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Полное имя</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Введите полное имя"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Москва"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="ул. Примерная, д. 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Почтовый индекс</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder="123456"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Компонент аналитики профиля
interface ProfileAnalyticsProps {
  orders: OrderInDB[];
  isLoading: boolean;
}

function ProfileAnalytics({ orders, isLoading }: ProfileAnalyticsProps) {
  const analyticsData = useMemo(() => {
    if (!orders?.length) return null;

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const avgOrderValue = totalSpent / totalOrders;

    // Статистика по статусам
    const statusStats = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Статистика по месяцам
    const monthlyStats = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
      });
      if (!acc[month]) {
        acc[month] = { count: 0, spent: 0 };
      }
      acc[month].count += 1;
      acc[month].spent += parseFloat(order.totalAmount);
      return acc;
    }, {} as Record<string, { count: number; spent: number }>);

    // Топ товары
    const productStats = orders.reduce((acc, order) => {
      order.orderItems?.forEach((item) => {
        if (!acc[item.name]) {
          acc[item.name] = { count: 0, spent: 0 };
        }
        acc[item.name].count += item.quantity;
        acc[item.name].spent += parseFloat(item.priceSnapshot) * item.quantity;
      });
      return acc;
    }, {} as Record<string, { count: number; spent: number }>);

    const topProducts = Object.entries(productStats)
      .sort(([, a], [, b]) => b.spent - a.spent)
      .slice(0, 5);

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      statusStats,
      monthlyStats,
      topProducts,
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
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-8">
          <p>Загрузка аналитики...</p>
        </div>
      ) : analyticsData ? (
        <>
          {/* Основная статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {formatPrice(analyticsData.totalSpent)}
                </div>
                <p className="text-sm text-green-600 font-medium">
                  Потрачено всего
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
          </div>

          {/* График по статусам */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Заказы по статусам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analyticsData.statusStats).map(
                  ([status, count]) => {
                    const maxCount = Math.max(
                      ...Object.values(analyticsData.statusStats)
                    );
                    return (
                      <div key={status} className="flex items-center gap-4">
                        <div className="w-28 text-sm font-medium">
                          {statusLabels[status as keyof typeof statusLabels] ||
                            status}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div
                            className="bg-primary h-6 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2 shadow-sm"
                            style={{
                              width: `${Math.max(
                                (count / maxCount) * 100,
                                8
                              )}%`,
                              minWidth: "30px",
                            }}
                          >
                            <span className="text-xs text-primary-foreground font-semibold">
                              {count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Топ товары */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Любимые товары
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topProducts.map(([product, stats], index) => (
                  <div
                    key={product}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product}</p>
                        <p className="text-sm text-muted-foreground">
                          Куплено: {stats.count} шт.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatPrice(stats.spent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Нет данных для анализа</p>
          <p className="text-sm">
            Сделайте первый заказ, чтобы увидеть статистику
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const router = useRouter();

  // Загружаем заказы пользователя
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useGetuserordersapiordersget({
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await logout();
      notifications.auth.logoutSuccess();
      router.push("/");
    } catch (error) {
      logger.error("Ошибка выхода", error, {
        component: "ProfilePage",
        userId: user?.id,
      });
      notifications.auth.loginError(error as Error);
    }
  };

  const handleSaveProfile = async (data: ProfileData) => {
    setIsEditingProfile(true);
    try {
      // Здесь должен быть API вызов для сохранения профиля
      // await updateProfile(data);
      toast.success("Профиль успешно обновлен!");
    } catch (error) {
      toast.error("Ошибка при обновлении профиля");
    } finally {
      setIsEditingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Профиль</h1>
        <p>Загрузка...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Профиль</h1>
        <p>Пожалуйста, войдите в систему для просмотра профиля.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Профиль</h1>
        <div className="flex flex-wrap gap-2">
          <EditProfileModal
            user={user}
            onSave={handleSaveProfile}
            isLoading={isEditingProfile}
          />
          <Button onClick={handleLogout} variant="outline">
            Выйти
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Аналитика
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>

        {/* Вкладка "Обзор" */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Информация о пользователе */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Личная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  {user.fullName && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Имя</p>
                        <p className="font-medium">{user.fullName}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={user.isAdmin ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {user.isAdmin ? "Администратор" : "Пользователь"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Статус аккаунта
                      </p>
                      <p className="font-medium">Активный</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Быстрая статистика */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Быстрая статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Всего заказов</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {orders?.length
                      ? formatPrice(
                          orders.reduce(
                            (sum, order) => sum + parseFloat(order.totalAmount),
                            0
                          )
                        )
                      : formatPrice(0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Потрачено</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders?.filter((order) => order.status === "delivered")
                      .length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Доставлено</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Последние заказы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Последние заказы
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <p>Загрузка заказов...</p>
              ) : orders?.length ? (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: OrderInDB) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Заказ #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(parseFloat(order.totalAmount))}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  У вас еще нет заказов
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "Заказы" */}
        <TabsContent value="orders" className="space-y-6">
          {ordersLoading ? (
            <p>Загрузка заказов...</p>
          ) : ordersError ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-destructive text-center">
                  Не удалось загрузить заказы. Попробуйте обновить страницу.
                </p>
              </CardContent>
            </Card>
          ) : orders?.length ? (
            <div className="space-y-4">
              {orders.map((order: OrderInDB) => (
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
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatPrice(parseFloat(order.totalAmount))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h3 className="font-semibold mb-2">
                          Информация о доставке:
                        </h3>
                        <p>
                          <strong>Имя:</strong> {order.fullName}
                        </p>
                        <p>
                          <strong>Телефон:</strong> {order.phone}
                        </p>
                        <p>
                          <strong>Email:</strong> {order.email}
                        </p>
                        <p>
                          <strong>Адрес:</strong> {order.address}, {order.city},{" "}
                          {order.postalCode}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Товары:</h3>
                        <ul className="space-y-1">
                          {order.orderItems?.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-8 w-8 object-cover rounded-md"
                                />
                              )}
                              <span className="text-xs">
                                {item.name} x{item.quantity} -{" "}
                                {formatPrice(parseFloat(item.priceSnapshot))}
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
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">У вас еще нет заказов</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Вкладка "Аналитика" */}
        <TabsContent value="analytics">
          <ProfileAnalytics orders={orders || []} isLoading={ordersLoading} />
        </TabsContent>

        {/* Вкладка "Настройки" */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Настройки аккаунта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Уведомления по email</h3>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления о статусе заказов
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Настроить
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Изменить пароль</h3>
                  <p className="text-sm text-muted-foreground">
                    Обновить пароль для входа в аккаунт
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Изменить
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
                <div>
                  <h3 className="font-medium text-destructive">
                    Удалить аккаунт
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Полностью удалить аккаунт и все данные
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
