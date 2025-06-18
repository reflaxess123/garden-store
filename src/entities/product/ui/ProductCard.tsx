"use client";

import { useCart } from "@/features/cart/CartContext";
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
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Заглушка для типа Product, так как Product API еще не создан
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  discount?: number | null;
  imageUrl: string | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.discount
    ? (product.price - (product.discount || 0)).toFixed(2)
    : product.price.toFixed(2);
  const originalPrice = product.price.toFixed(2);

  const { isProductFavourite } = useFavourites();
  const initialIsFavourite = isProductFavourite(product.id);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1); // Добавляем 1 единицу товара
  };

  return (
    <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full">
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
              <div className="absolute top-2 right-2 z-10">
                <FavouriteButton
                  productId={product.id}
                  initialIsFavourite={initialIsFavourite}
                />
              </div>
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
        <Button className="w-full" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" /> В корзину
        </Button>
      </div>
    </Card>
  );
}
