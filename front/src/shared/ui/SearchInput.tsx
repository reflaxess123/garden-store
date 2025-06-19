"use client";

import { Input } from "@/shared/ui/input";
import { Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

function SearchInputInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const [text, setText] = useState(initialQuery);
  const [query] = useDebounce(text, 400);

  useEffect(() => {
    if (query) {
      router.push(`/?q=${query}`);
    } else {
      router.push("/");
    }
  }, [query, router]);

  const isSearching = text !== query && text.length > 0;

  return (
    <div className="relative w-full max-w-xs">
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
    </div>
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
