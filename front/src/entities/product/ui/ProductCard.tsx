"use client";

import { Product } from "@/entities/product/api";
import { useCart } from "@/features/cart/hooks";
import { FavouriteButton } from "@/features/manage-favourites/ui/FavouriteButton";
import { useFavourites } from "@/features/manage-favourites/useFavourites";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = parseFloat(product.price); // Преобразуем цену в число
  const discount =
    product.discount !== null ? parseFloat(product.discount) : null;

  const displayPrice = discount
    ? (price - (discount || 0)).toFixed(2)
    : price.toFixed(2);
  const originalPrice = price.toFixed(2);

  const { isLoading: isFavouritesLoading } = useFavourites();
  const { addItem, updateQuantity, items } = useCart();

  // Находим товар в корзине
  const cartItem = items.find((item) => item.productId === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  // Локальное состояние для оптимистичных обновлений
  const [optimisticQuantity, setOptimisticQuantity] = useState(0);

  const handleAddToCart = () => {
    setOptimisticQuantity(optimisticQuantity + 1);
    addItem(
      {
        id: product.id,
        name: product.name,
        price: price,
        imageUrl: product.imageUrl,
      },
      1
    );
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartItem) {
      setOptimisticQuantity(cartItem.quantity + 1);
      updateQuantity(cartItem.cartId, cartItem.quantity + 1);
    } else {
      handleAddToCart();
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartItem && cartItem.quantity > 0) {
      setOptimisticQuantity(cartItem.quantity - 1);
      updateQuantity(cartItem.cartId, cartItem.quantity - 1);
    }
  };

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Показываем актуальное количество или оптимистичное
  const displayQuantity =
    quantityInCart > 0 ? quantityInCart : optimisticQuantity;

  return (
    <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full">
      {/* FavouriteButton вынесен за пределы Link */}
      <div
        className="absolute top-2 right-2 z-10"
        onClick={handleFavouriteClick}
      >
        <FavouriteButton
          productId={product.id}
          isLoading={isFavouritesLoading}
        />
      </div>

      <Link href={`/product/${product.slug}`} className="flex-grow block p-0">
        <CardHeader className="p-0 mb-2">
          {product.imageUrl && (
            <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-4 pt-2">
          <CardTitle className="text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {product.name}
          </CardTitle>
          {product.description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-2">
              {product.description}
            </CardDescription>
          )}
          <div className="mt-auto flex items-baseline space-x-2">
            <span className="text-xl font-bold text-foreground">
              {displayPrice} руб.
            </span>
            {product.discount && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice} руб.
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <div className="p-4 pt-0">
        {displayQuantity > 0 ? (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {displayQuantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" /> В корзину
          </Button>
        )}
      </div>
    </Card>
  );
}
