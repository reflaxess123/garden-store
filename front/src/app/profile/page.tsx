"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Settings, ShoppingBag, TrendingUp, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ProfileFormData } from "@/entities/user";
import { useAuth } from "@/features/auth/AuthContext";
import { EditProfileModal } from "@/features/profile";
import { formatPrice, logger, notifications } from "@/shared";
import {
  OrderInDB,
  useGetUserOrdersApiOrdersGet,
} from "@/shared/api/generated";
import {
  ProfileAnalytics,
  ProfileOverview,
  RecentOrders,
} from "@/widgets/profile";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const router = useRouter();

  const {
    data: orders,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useGetUserOrdersApiOrdersGet(
    {},
    {
      query: {
        enabled: !!user,
      },
    }
  );

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

  const handleSaveProfile = async (data: ProfileFormData) => {
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

        <TabsContent value="overview" className="space-y-6">
          <ProfileOverview
            user={user}
            orders={orders}
            isOrdersLoading={isOrdersLoading}
            ordersError={ordersError}
          />
          <RecentOrders
            orders={orders}
            isLoading={isOrdersLoading}
            error={ordersError}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersList
            orders={orders}
            isLoading={isOrdersLoading}
            error={ordersError}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <ProfileAnalytics orders={orders || []} isLoading={isOrdersLoading} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// Временные компоненты для заказов и настроек (можно вынести в отдельные файлы)
function OrdersList({
  orders,
  isLoading,
  error,
}: {
  orders: OrderInDB[] | undefined;
  isLoading: boolean;
  error: any;
}) {
  if (isLoading) {
    return <p>Загрузка заказов...</p>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive text-center">
            Не удалось загрузить заказы. Попробуйте обновить страницу.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!orders?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">У вас еще нет заказов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: OrderInDB) => (
        <Card key={order.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatPrice(parseFloat(order.totalAmount))}
                </p>
                <p className="text-sm text-muted-foreground">{order.status}</p>
              </div>
            </div>

            {order.orderItems && (
              <div className="space-y-2">
                {order.orderItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} шт. ×{" "}
                        {formatPrice(parseFloat(item.priceSnapshot))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProfileSettings() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
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
              <h3 className="font-medium text-destructive">Удалить аккаунт</h3>
              <p className="text-sm text-muted-foreground">
                Полностью удалить аккаунт и все данные
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Удалить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
