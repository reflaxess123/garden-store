import { Category } from "@/entities/category/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/catalog/${category.slug}`}>
      <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm p-4 text-center">
                Изображение категории
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {category.name}
          </CardTitle>
          {category.description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
              {category.description}
            </CardDescription>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
