"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { Heart, Menu, UserCircle2 } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/features/cart/useCart";
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
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import CartPanel from "@/widgets/CartPanel";

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems: cartItemCount } = useCart();
  const { favoriteItemCount } = useFavourites();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header className="bg-background text-foreground p-4 shadow-md border-b">
      <div className="container mx-auto flex items-center justify-between">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[250px] sm:w-[300px] bg-background text-foreground pt-10"
            >
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-lg font-semibold">
                  Garden Store
                </Link>
                {/* Здесь будет SearchInput для мобильной версии, пока скрыт */}
                {/* <SearchInput /> */}
                <Link href="/favourites" className="flex items-center gap-2">
                  <Heart className="h-5 w-5" /> Избранное ({favoriteItemCount})
                </Link>
                <CartPanel />
                {user ? (
                  <>
                    <Link href="/profile" className="flex items-center gap-2">
                      <UserCircle2 className="h-5 w-5" /> Профиль
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2">
                      <UserCircle2 className="h-5 w-5" /> Заказы
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2">
                        Админ-панель
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start pl-2"
                    >
                      Выйти
                    </Button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-2">
                    Войти
                  </Link>
                )}
                <div className="mt-4">
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="ml-4 text-xl font-bold">
            Garden Store
          </Link>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex flex-1 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground">
            Магаз Мамаши
          </Link>

          <div className="flex-1 flex justify-center">
            <SearchInput />
          </div>

          <nav className="flex items-center space-x-6">
            <ThemeToggle />
            <Link href="/favourites">
              <BadgeIcon count={favoriteItemCount}>
                <Heart className="h-6 w-6" />
              </BadgeIcon>
            </Link>
            <CartPanel />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  {/* Заглушка аватара */}
                  <UserCircle2 className="h-8 w-8" />
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
