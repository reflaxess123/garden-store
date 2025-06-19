import { useAuth } from "@/features/auth/AuthContext";
import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export function AuthButtons() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (user) {
    return (
      <Button
        onClick={async () => {
          await supabaseClient.auth.signOut();
        }}
      >
        Выйти
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
