"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Ошибка выхода:", error);
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
      <h1 className="text-3xl font-bold mb-6">Профиль</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Информация о пользователе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          {user.fullName && (
            <div>
              <strong>Имя:</strong> {user.fullName}
            </div>
          )}
          <div>
            <strong>Роль:</strong>{" "}
            {user.isAdmin ? "Администратор" : "Пользователь"}
          </div>

          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Выйти
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
