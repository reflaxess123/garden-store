"use client";

import { Input } from "@/shared/ui/input";
import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

function SearchInputInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentQuery = searchParams?.get("q") || "";

  const [text, setText] = useState(currentQuery);
  const [query] = useDebounce(text, 400);
  const isInitialMount = useRef(true);
  const lastNavigatedQuery = useRef(currentQuery);

  // Синхронизируем локальное состояние с URL при изменении страницы
  useEffect(() => {
    if (currentQuery !== lastNavigatedQuery.current) {
      setText(currentQuery);
      lastNavigatedQuery.current = currentQuery;
    }
  }, [currentQuery]);

  useEffect(() => {
    // Пропускаем первый рендер
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Не навигируем если запрос не изменился
    if (query === lastNavigatedQuery.current) {
      return;
    }

    // Навигируем только если есть реальное изменение
    if (query.trim()) {
      const newUrl = `/catalog?q=${encodeURIComponent(query.trim())}`;
      lastNavigatedQuery.current = query.trim();
      router.push(newUrl);
    } else if (currentQuery && pathname === "/catalog") {
      // Очищаем поиск только если убираем существующий запрос
      lastNavigatedQuery.current = "";
      router.push("/catalog");
    }
  }, [query, router, currentQuery, pathname]);

  // Обработчик отправки формы по Enter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && text.trim() !== currentQuery) {
      lastNavigatedQuery.current = text.trim();
      router.push(`/catalog?q=${encodeURIComponent(text.trim())}`);
    }
  };

  const isSearching = text !== query && text.length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <Input
        placeholder="Поиск товаров..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="pl-10 pr-4"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
    </form>
  );
}

export function SearchInput() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full max-w-xs">
          <Input
            placeholder="Поиск товаров..."
            className="pl-10 pr-4"
            disabled
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
        </div>
      }
    >
      <SearchInputInner />
    </Suspense>
  );
}
