"use client";

import { Input } from "@/shared/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [text, setText] = useState(initialQuery);
  const [query] = useDebounce(text, 400);

  useEffect(() => {
    if (query) {
      router.push(`/?q=${query}`);
    } else {
      router.push("/");
    }
  }, [query, router]);

  return (
    <Input
      placeholder="Поиск товаров..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full max-w-xs"
    />
  );
}
