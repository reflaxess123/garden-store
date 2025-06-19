"use client";

import { Button } from "@/shared/ui/button";
import { Heart } from "lucide-react";
import { useFavourites } from "../useFavourites";

interface FavouriteButtonProps {
  productId: string;
  initialIsFavourite?: boolean; // Делаем опциональным, так как теперь используем глобальное состояние
  isLoading?: boolean;
}

export function FavouriteButton({
  productId,
  isLoading,
}: FavouriteButtonProps) {
  const {
    toggleFavourite,
    isProductFavourite,
    isLoading: isFavouritesLoading,
  } = useFavourites();

  const isFavourite = isProductFavourite(productId);
  const isButtonLoading = isLoading || isFavouritesLoading;

  const handleToggleFavourite = async () => {
    await toggleFavourite(productId);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavourite}
      aria-pressed={isFavourite}
      disabled={isButtonLoading}
      className={
        isFavourite
          ? "text-red-500 hover:text-red-600 transition-colors duration-200"
          : "text-muted-foreground hover:text-foreground transition-colors duration-200"
      }
    >
      <Heart className={isFavourite ? "fill-current" : ""} />
    </Button>
  );
}
