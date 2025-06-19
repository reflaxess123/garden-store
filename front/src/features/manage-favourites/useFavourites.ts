"use client";

import { useAuth } from "@/features/auth/AuthContext";
import {
  FavouriteInDB,
  useAddtofavoritesapifavoritesproductidpost,
  useGetfavoritesapifavoritesget,
  useRemovefromfavoritesapifavoritesproductiddelete,
} from "@/shared/api/generated";

interface FavouriteItem {
  productId: string;
}

export const useFavourites = () => {
  const { user, isAuthenticated } = useAuth();

  // Получаем избранное с сервера
  const { data: favoritesData, isLoading: isFavouritesLoading } =
    useGetfavoritesapifavoritesget({
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

  // Мутации для добавления/удаления избранного
  const addMutation = useAddtofavoritesapifavoritesproductidpost();
  const removeMutation = useRemovefromfavoritesapifavoritesproductiddelete();

  const toggleFavourite = async (productId: string) => {
    if (!isAuthenticated) {
      console.warn("User not logged in. Cannot toggle favourite.");
      return;
    }

    const isCurrentlyFavourite = isProductFavourite(productId);

    if (isCurrentlyFavourite) {
      // Remove from favourites
      removeMutation.mutate(productId);
    } else {
      // Add to favourites
      addMutation.mutate(productId);
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
