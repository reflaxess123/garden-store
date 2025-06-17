"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login"); // Перенаправление на страницу входа после выхода
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <p>Загрузка профиля...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <p>
          Вы не авторизованы. Пожалуйста, войдите, чтобы просмотреть профиль.
        </p>
        <Button onClick={() => router.push("/login")}>Войти</Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Профиль пользователя</CardTitle>
          <CardDescription>
            Здесь вы можете просмотреть свою информацию.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Email:</h3>
            <p>{user.email}</p>
          </div>
          {user.user_metadata?.fullName && (
            <div>
              <h3 className="font-semibold">Полное имя:</h3>
              <p>{user.user_metadata.fullName}</p>
            </div>
          )}
          {user.user_metadata?.isAdmin && (
            <div>
              <h3 className="font-semibold">Роль:</h3>
              <p>Администратор</p>
            </div>
          )}
          <Button onClick={handleSignOut} className="w-full">
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
