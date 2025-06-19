"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface FavouriteItem {
  productId: string;
}

export const useFavourites = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const supabase = supabaseClient;
  const queryClient = useQueryClient();

  const { data: favourites, isLoading: isFavouritesLoading } = useQuery<
    FavouriteItem[]
  >({
    queryKey: ["favourites", user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      const { data, error } = await supabase
        .from("Favourite")
        .select("productId")
        .eq("userId", user.id);

      if (error) {
        console.error("Error fetching favourites:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user, // Only run query if user is logged in
  });

  const isProductFavourite = (productId: string) => {
    return favourites?.some((fav) => fav.productId === productId) || false;
  };

  const toggleFavourite = async (productId: string) => {
    if (!user) {
      console.warn("User not logged in. Cannot toggle favourite.");
      return;
    }

    const isCurrentlyFavourite = isProductFavourite(productId);

    if (isCurrentlyFavourite) {
      // Remove from favourites
      const { error } = await supabase
        .from("Favourite")
        .delete()
        .eq("userId", user.id)
        .eq("productId", productId);

      if (error) {
        console.error("Error removing favourite:", error);
        throw error;
      }
    } else {
      // Add to favourites
      const { error } = await supabase.from("Favourite").insert({
        userId: user.id,
        productId: productId,
      });

      if (error) {
        console.error("Error adding favourite:", error);
        throw error;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["favourites", user?.id] });
  };

  return {
    favourites: favourites || [],
    isLoading: isFavouritesLoading || isAuthLoading,
    isProductFavourite,
    toggleFavourite,
    favoriteItemCount: favourites?.length || 0,
  };
};
