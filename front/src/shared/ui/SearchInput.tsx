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
  const initialQuery = searchParams?.get("q") || "";
  const isInitialMount = useRef(true);

  const [text, setText] = useState(initialQuery);
  const [query] = useDebounce(text, 400);

  useEffect(() => {
    // Пропускаем первый рендер, чтобы избежать редиректов при инициализации
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Выполняем поиск только если пользователь что-то ввел
    if (query && query !== initialQuery) {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
    } else if (!query && initialQuery && pathname === "/catalog") {
      // Очищаем поиск только если мы на странице каталога и убрали поисковый запрос
      router.push("/catalog");
    }
  }, [query, router, initialQuery, pathname]);

  // Обработчик отправки формы по Enter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
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
