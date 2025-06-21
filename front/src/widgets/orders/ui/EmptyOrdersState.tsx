"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function EmptyOrdersState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="bg-muted rounded-full p-6 mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            У вас пока нет заказов
          </h2>

          <p className="text-muted-foreground mb-6">
            Начните покупки в нашем каталоге и ваши заказы появятся здесь
          </p>

          <Button asChild>
            <Link href="/catalog">Перейти к покупкам</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
