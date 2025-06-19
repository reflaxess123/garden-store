"use client";

import { getProductById, Product } from "@/entities/product/api";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useAuth } from "@/features/auth/AuthContext";
import { useFavourites } from "@/features/manage-favourites/useFavourites";
import { Button } from "@/shared/ui/button";
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";

export default function FavouritesPage() {
  const { favourites, isLoading: isLoadingFavourites } = useFavourites();
  const { user } = useAuth();

  const productQueries = useQueries({
    queries: favourites.map((fav) => ({
      queryKey: ["product", fav.productId],
      queryFn: () => getProductById(fav.productId),
      enabled: !!user && !!fav.productId, // Enable query only if user and productId exist
    })),
  });

  const isLoadingProducts = productQueries.some((query) => query.isLoading);
  const hasErrors = productQueries.some((query) => query.isError);
  const products = productQueries
    .map((query) => query.data)
    .filter(Boolean) as Product[];

  if (isLoadingFavourites || isLoadingProducts) {
    return <div className="container mx-auto p-4">Загрузка избранного...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Войдите, чтобы просмотреть избранное
        </h1>
        <p className="text-lg text-muted-foreground">
          Пожалуйста, войдите в свой аккаунт, чтобы сохранять и просматривать
          избранные товары.
        </p>
        <Link href="/login">
          <Button>Войти</Button>
        </Link>
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center space-y-4">
        <h1 className="text-3xl font-bold">Ваш список избранного пуст</h1>
        <p className="text-lg text-muted-foreground">
          Добавляйте товары в избранное, чтобы быстро их находить.
        </p>
        <Link href="/catalog/all">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Произошла ошибка при загрузке некоторых товаров.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Ваше избранное</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
