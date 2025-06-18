"use client";

import { Button } from "@/shared/ui/button";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useFavourites } from "../useFavourites";

interface FavouriteButtonProps {
  productId: string;
  initialIsFavourite: boolean;
}

export function FavouriteButton({
  productId,
  initialIsFavourite,
}: FavouriteButtonProps) {
  const { toggleFavourite } = useFavourites();
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);

  useEffect(() => {
    setIsFavourite(initialIsFavourite);
  }, [initialIsFavourite]);

  const handleToggleFavourite = async () => {
    await toggleFavourite(productId);
    setIsFavourite((prev) => !prev);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavourite}
      aria-pressed={isFavourite}
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
