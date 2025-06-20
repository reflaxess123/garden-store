"use client";

import { useCart } from "@/features/cart/useCart";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Home, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BottomNavBar = () => {
  const { totalItems: cartItemCount } = useCart();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Главная",
      isActive: pathname === "/",
    },
    {
      href: "/catalog",
      icon: Store,
      label: "Каталог",
      isActive: pathname.startsWith("/catalog"),
    },
    {
      href: "/cart",
      icon: ShoppingBag,
      label: "Корзина",
      isActive: pathname === "/cart",
      badge: isMounted ? cartItemCount : 0,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t shadow-lg">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative",
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
