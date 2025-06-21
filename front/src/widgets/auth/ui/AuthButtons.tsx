import { useAuth } from "@/features/auth/AuthContext";
import { useLogoutApiAuthLogoutPost } from "@/shared/api/generated";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export function AuthButtons() {
  const { user, logout } = useAuth();
  const logoutMutation = useLogoutApiAuthLogoutPost();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      toast.success("Вы успешно вышли из аккаунта");
    } catch (error) {
      toast.error("Ошибка при выходе из аккаунта");
    }
  };

  if (user) {
    return (
      <Button onClick={handleLogout} disabled={logoutMutation.isPending}>
        {logoutMutation.isPending ? "Выход..." : "Выйти"}
      </Button>
    );
  } else {
    return (
      <Button asChild>
        <Link href="/login">Войти</Link>
      </Button>
    );
  }
}
