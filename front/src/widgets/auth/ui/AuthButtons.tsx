import { useAuth } from "@/features/auth/AuthContext";
import { useLogoutapiauthlogoutpost } from "@/shared/api/generated";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export function AuthButtons() {
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogoutapiauthlogoutpost();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (user) {
    return (
      <Button
        onClick={() => {
          logoutMutation.mutate();
        }}
        disabled={logoutMutation.isPending}
      >
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
