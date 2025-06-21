import { cn } from "../lib/utils";
import {
  FileText,
  LucideIcon,
  Package,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>

      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && <Button onClick={action.onClick}>{action.text}</Button>}
    </div>
  );
}

// Предустановленные варианты для частых случаев
export function EmptyCart({ onGoShopping }: { onGoShopping?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Корзина пуста"
      description="Добавьте товары в корзину, чтобы сделать заказ"
      action={
        onGoShopping
          ? {
              text: "Перейти к покупкам",
              onClick: onGoShopping,
            }
          : undefined
      }
    />
  );
}

export function EmptyProducts({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="Товары не найдены"
      description="В данной категории пока нет товаров"
      action={
        onAddProduct
          ? {
              text: "Добавить товар",
              onClick: onAddProduct,
            }
          : undefined
      }
    />
  );
}

export function EmptySearch({
  searchQuery,
  onClearSearch,
}: {
  searchQuery?: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="Ничего не найдено"
      description={
        searchQuery
          ? `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить поисковый запрос.`
          : "Попробуйте изменить поисковый запрос или фильтры."
      }
      action={
        onClearSearch
          ? {
              text: "Очистить поиск",
              onClick: onClearSearch,
            }
          : undefined
      }
    />
  );
}

export function EmptyUsers({ onInviteUser }: { onInviteUser?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Пользователи не найдены"
      description="Пока нет зарегистрированных пользователей"
      action={
        onInviteUser
          ? {
              text: "Пригласить пользователя",
              onClick: onInviteUser,
            }
          : undefined
      }
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={FileText}
      title="Заказы не найдены"
      description="У вас пока нет заказов"
    />
  );
}
