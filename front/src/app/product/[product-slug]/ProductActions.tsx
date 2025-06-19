"use client";

import { useCart } from "@/features/cart/CartContext";
import { FavouriteButton } from "@/features/manage-favourites/ui/FavouriteButton";
import { useFavourites } from "@/features/manage-favourites/useFavourites";
import { Button } from "@/shared/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductActionsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCart();
  const { isProductFavourite, isLoading } = useFavourites();

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  const initialIsFavourite = isProductFavourite(product.id);

  return (
    <div className="flex items-center gap-4 mt-6">
      <Button onClick={handleAddToCart} className="flex-1">
        <ShoppingCart className="h-5 w-5 mr-2" /> В корзину
      </Button>
      <FavouriteButton
        productId={product.id}
        initialIsFavourite={initialIsFavourite}
        isLoading={isLoading}
      />
    </div>
  );
}
