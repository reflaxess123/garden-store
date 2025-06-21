"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { logger } from "@/shared";
import {
  FavouriteInDB,
  useAddToFavoritesApiFavoritesProductIdPost,
  useGetFavoritesApiFavoritesGet,
  useRemoveFromFavoritesApiFavoritesProductIdDelete,
} from "@/shared/api/generated";
import { useQueryClient } from "@tanstack/react-query";

interface FavouriteItem {
  productId: string;
}

export const useFavourites = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Получаем избранное с сервера
  const { data: favoritesData, isLoading: isFavouritesLoading } =
    useGetFavoritesApiFavoritesGet({
      enabled: isAuthenticated,
    });

  // Преобразуем данные в нужный формат
  const favourites: FavouriteItem[] =
    favoritesData?.map((fav: FavouriteInDB) => ({
      productId: fav.productId,
    })) || [];

  const isProductFavourite = (productId: string) => {
    return favourites.some((fav) => fav.productId === productId);
  };

  // Мутации для управления избранным
  const addMutation = useAddToFavoritesApiFavoritesProductIdPost();
  const removeMutation = useRemoveFromFavoritesApiFavoritesProductIdDelete();

  const toggleFavourite = async (productId: string) => {
    if (!isAuthenticated) {
      logger.warn("User not logged in. Cannot toggle favourite.", {
        component: "useFavourites",
        action: "toggleFavourite",
        productId,
      });
      return;
    }

    const isCurrentlyFavourite = isProductFavourite(productId);

    if (isCurrentlyFavourite) {
      // Оптимистично удаляем из UI
      queryClient.setQueryData(
        ["getFavoritesApiFavoritesGet"],
        (old: FavouriteInDB[] | undefined) => {
          if (!old) return [];
          return old.filter((fav) => fav.productId !== productId);
        }
      );

      // Удаляем с сервера
      removeMutation.mutate(productId, {
        onSuccess: () => {
          // Обновляем кэш после успешного удаления
          queryClient.invalidateQueries({
            queryKey: ["getFavoritesApiFavoritesGet"],
          });
        },
        onError: () => {
          // Откатываем оптимистичное обновление при ошибке
          queryClient.invalidateQueries({
            queryKey: ["getFavoritesApiFavoritesGet"],
          });
        },
      });
    } else {
      // Оптимистично добавляем в UI
      queryClient.setQueryData(
        ["getFavoritesApiFavoritesGet"],
        (old: FavouriteInDB[] | undefined) => {
          if (!old) return [{ productId } as FavouriteInDB];
          return [...old, { productId } as FavouriteInDB];
        }
      );

      // Добавляем на сервер
      addMutation.mutate(productId, {
        onSuccess: () => {
          // Обновляем кэш после успешного добавления
          queryClient.invalidateQueries({
            queryKey: ["getFavoritesApiFavoritesGet"],
          });
        },
        onError: () => {
          // Откатываем оптимистичное обновление при ошибке
          queryClient.invalidateQueries({
            queryKey: ["getFavoritesApiFavoritesGet"],
          });
        },
      });
    }
  };

  return {
    favourites,
    isLoading: isFavouritesLoading,
    isProductFavourite,
    toggleFavourite,
    favoriteItemCount: favourites.length,
  };
};
