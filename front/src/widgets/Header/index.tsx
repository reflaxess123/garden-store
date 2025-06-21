"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { Heart, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useFavourites } from "@/features/manage-favourites/useFavourites";
import { Badge } from "@/shared/ui/badge";
import { BadgeIcon } from "@/shared/ui/BadgeIcon";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { SearchInput } from "@/shared/ui/SearchInput";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import CartPanel from "@/widgets/CartPanel";
import { ChatButton } from "@/widgets/ChatButton";
import { NotificationPanel } from "@/widgets/NotificationPanel";

const Header = () => {
  const { user, logout } = useAuth();
  const { favoriteItemCount } = useFavourites();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground shadow-md border-b">
      <div className="container mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Поиск слева */}
            <div className="flex-1">
              <SearchInput />
            </div>

            {/* Правая часть с переключателем темы и аватаркой */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full p-0"
                  >
                    <UserCircle2 className="h-5 w-5" />
                    {user?.isAdmin && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end" forceMount>
                  {user ? (
                    <>
                      <div className="px-2 py-1 border-b">
                        <NotificationPanel />
                      </div>
                      <Link href="/profile">
                        <DropdownMenuItem>Профиль</DropdownMenuItem>
                      </Link>
                      <Link href="/orders">
                        <DropdownMenuItem>Заказы</DropdownMenuItem>
                      </Link>
                      <Link href="/favourites">
                        <DropdownMenuItem>
                          Избранное ({isMounted ? favoriteItemCount : 0})
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/support/chat">
                        <DropdownMenuItem>Чат поддержки</DropdownMenuItem>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin">
                          <DropdownMenuItem>Админ-панель</DropdownMenuItem>
                        </Link>
                      )}
                      <DropdownMenuItem onClick={handleSignOut}>
                        Выйти
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <Link href="/login">
                      <DropdownMenuItem>Войти</DropdownMenuItem>
                    </Link>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            Садовый рай
          </Link>

          <div className="flex-1 flex justify-center">
            <SearchInput />
          </div>

          <nav className="flex items-center space-x-6">
            <ThemeToggle />
            {user && <NotificationPanel />}
            <ChatButton />
            <Link href="/favourites">
              <BadgeIcon count={isMounted ? favoriteItemCount : 0}>
                <Heart className="h-5 w-5" />
              </BadgeIcon>
            </Link>
            <CartPanel />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <UserCircle2 className="h-5 w-5" />
                  {user?.isAdmin && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-auto rounded-full px-2 py-0 text-xs font-semibold"
                    >
                      Админ
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {user ? (
                  <>
                    <Link href="/profile">
                      <DropdownMenuItem>Профиль</DropdownMenuItem>
                    </Link>
                    <Link href="/orders">
                      <DropdownMenuItem>Заказы</DropdownMenuItem>
                    </Link>
                    <Link href="/favourites">
                      <DropdownMenuItem>Избранное</DropdownMenuItem>
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem>Админ-панель</DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      Выйти
                    </DropdownMenuItem>
                  </>
                ) : (
                  <Link href="/login">
                    <DropdownMenuItem>Войти</DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
