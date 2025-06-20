"use client";

import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import { cn } from "@/shared/lib/utils";
import { Home, Package, ShoppingBag, Tags, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
}

function AdminNavLink({ href, children }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      {children}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <AuthGuard adminOnly={true}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link
                href="/admin"
                className="flex items-center gap-2 font-semibold"
              >
                <Home className="h-6 w-6" />
                <span>Админ-панель</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <AdminNavLink href="/admin">
                  <Home className="h-4 w-4" />
                  Обзор
                </AdminNavLink>
                <AdminNavLink href="/admin/products">
                  <Package className="h-4 w-4" />
                  Продукты
                </AdminNavLink>
                <AdminNavLink href="/admin/categories">
                  <Tags className="h-4 w-4" />
                  Категории
                </AdminNavLink>
                <AdminNavLink href="/admin/orders">
                  <ShoppingBag className="h-4 w-4" />
                  Заказы
                </AdminNavLink>
                <AdminNavLink href="/admin/users">
                  <Users className="h-4 w-4" />
                  Пользователи
                </AdminNavLink>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* Здесь можно добавить мобильную навигацию или другие элементы шапки */}
            <h1 className="text-xl font-semibold">Панель администратора</h1>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
