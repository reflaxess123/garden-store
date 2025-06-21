"use client";

import { AuthGuard } from "@/features/auth/ui/AuthGuard";
import {
  cn,
  ErrorBoundary,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared";
import {
  Home,
  MessageCircle,
  Package,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminNavLinkProps {
  href: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  label?: string;
}

function AdminNavLink({
  href,
  children,
  isCollapsed = false,
  label,
}: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary",
        isCollapsed && "justify-center px-2"
      )}
    >
      {children}
    </Link>
  );

  if (isCollapsed && label) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <AuthGuard adminOnly={true}>
      <ErrorBoundary fallback="Произошла ошибка в админ-панели">
        <div
          className={cn(
            "grid min-h-screen w-full transition-all duration-300",
            isCollapsed
              ? "md:grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr]"
              : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
          )}
        >
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <button
                  onClick={toggleSidebar}
                  className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                >
                  <Home className="h-6 w-6" />
                  {!isCollapsed && <span>Админ-панель</span>}
                </button>
              </div>
              <div className="flex-1">
                <TooltipProvider>
                  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <AdminNavLink
                      href="/admin"
                      isCollapsed={isCollapsed}
                      label="Обзор"
                    >
                      <Home className="h-4 w-4" />
                      {!isCollapsed && "Обзор"}
                    </AdminNavLink>
                    <AdminNavLink
                      href="/admin/products"
                      isCollapsed={isCollapsed}
                      label="Продукты"
                    >
                      <Package className="h-4 w-4" />
                      {!isCollapsed && "Продукты"}
                    </AdminNavLink>
                    <AdminNavLink
                      href="/admin/categories"
                      isCollapsed={isCollapsed}
                      label="Категории"
                    >
                      <Tags className="h-4 w-4" />
                      {!isCollapsed && "Категории"}
                    </AdminNavLink>
                    <AdminNavLink
                      href="/admin/orders"
                      isCollapsed={isCollapsed}
                      label="Заказы"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {!isCollapsed && "Заказы"}
                    </AdminNavLink>
                    <AdminNavLink
                      href="/admin/users"
                      isCollapsed={isCollapsed}
                      label="Пользователи"
                    >
                      <Users className="h-4 w-4" />
                      {!isCollapsed && "Пользователи"}
                    </AdminNavLink>
                    <AdminNavLink
                      href="/admin/chats"
                      isCollapsed={isCollapsed}
                      label="Чаты"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {!isCollapsed && "Чаты"}
                    </AdminNavLink>
                  </nav>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              {/* Здесь можно добавить мобильную навигацию или другие элементы шапки */}
              <h1 className="text-xl font-semibold">Панель администратора</h1>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <ErrorBoundary fallback="Произошла ошибка при загрузке админ-страницы">
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </div>
        <Toaster />
      </ErrorBoundary>
    </AuthGuard>
  );
}
