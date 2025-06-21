import { getAllCategories } from "@/entities/category/api";
import { CategoryCard } from "@/entities/category/ui/CategoryCard";
import { getBestsellers } from "@/entities/product/api";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  ArrowRight,
  Award,
  Headphones,
  Shield,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

// Импортируем новые компоненты
import { StatsGrid, type StatItem } from "@/shared/ui/layout";
import {
  CTASection,
  FeaturesSection,
  HeroSection,
  TestimonialsSection,
  type FeatureItem,
  type StatProps,
  type TestimonialItem,
} from "@/shared/ui/sections";

// Отключаем статическую генерацию, т.к. нужны API вызовы
export const dynamic = "force-dynamic";

// Данные для компонентов
const heroStats: StatProps[] = [
  {
    value: "1000+",
    label: "Довольных клиентов",
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "500+",
    label: "Товаров в каталоге",
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "99%",
    label: "Положительных отзывов",
    color: "text-green-600 dark:text-green-400",
  },
];

const features: FeatureItem[] = [
  {
    icon: Truck,
    title: "Быстрая доставка",
    description: "Доставим ваш заказ в течение 1-3 рабочих дней по всей России",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Гарантия качества",
    description:
      "Все товары проходят строгий контроль качества перед отправкой",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Headphones,
    title: "Поддержка 24/7",
    description: "Наши эксперты готовы помочь вам в любое время дня и ночи",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Award,
    title: "Лучшие цены",
    description: "Конкурентные цены и регулярные скидки для наших клиентов",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const testimonials: TestimonialItem[] = [
  {
    name: "Анна Петрова",
    role: "Садовод-любитель",
    content:
      "Отличный магазин! Купила семена и горшки - все высокого качества. Растения прекрасно растут!",
    rating: 5,
    avatar: "👩‍🌾",
  },
  {
    name: "Михаил Сидоров",
    role: "Ландшафтный дизайнер",
    content:
      "Профессиональные инструменты по доступным ценам. Рекомендую всем коллегам!",
    rating: 5,
    avatar: "👨‍🌾",
  },
  {
    name: "Елена Козлова",
    role: "Дачница",
    content:
      "Быстрая доставка и отличное обслуживание. Заказываю здесь уже третий год подряд!",
    rating: 5,
    avatar: "👵",
  },
];

// Данные для статистики
const statsData: StatItem[] = [
  {
    icon: Users,
    value: "1,000+",
    label: "Довольных клиентов",
  },
  {
    icon: ShoppingBag,
    value: "5,000+",
    label: "Выполненных заказов",
  },
  {
    icon: Award,
    value: "99%",
    label: "Положительных отзывов",
  },
  {
    icon: Award,
    value: "3",
    label: "Года на рынке",
  },
];

export default async function Home() {
  const categories = await getAllCategories();
  const bestsellers = await getBestsellers(8);

  return (
    <main className="min-h-screen">
      {/* Героическая секция */}
      <HeroSection
        badge={{
          text: "🌱 Новая коллекция весна 2024",
          className:
            "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800",
        }}
        title="Ваш сад —"
        subtitle="наша страсть"
        description="Откройте мир садоводства с нашими качественными инструментами, семенами и горшками. Создайте сад своей мечты уже сегодня!"
        primaryAction={{
          label: "Начать покупки",
          href: "/catalog",
          icon: ArrowRight,
        }}
        secondaryAction={{
          label: "Смотреть каталог",
          href: "/catalog",
          icon: ShoppingBag,
          variant: "outline",
        }}
        image={{
          src: "/images/pots_category.jpg",
          alt: "Садовые инструменты и растения",
          width: 600,
          height: 500,
          priority: true,
        }}
        stats={heroStats}
      />

      {/* Секция преимуществ */}
      <FeaturesSection
        title="Почему выбирают нас?"
        description="Мы создаем лучший опыт покупок для садоводов всех уровней"
        features={features}
      />

      {/* Категории */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Наши категории
            </h2>
            <p className="text-xl text-muted-foreground">
              Все для вашего сада в одном месте
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/catalog" className="flex items-center gap-2">
                Смотреть все категории
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Хиты продаж */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800 mb-4">
              🔥 Популярные товары
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Хиты продаж
            </h2>
            <p className="text-xl text-muted-foreground">
              Самые популярные товары среди наших покупателей
            </p>
          </div>

          {bestsellers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-xl text-muted-foreground mb-6">
                Скоро здесь появятся популярные товары
              </p>
              <Button asChild>
                <Link href="/catalog">Смотреть каталог</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
                {bestsellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center">
                <Button asChild size="lg">
                  <Link href="/catalog" className="flex items-center gap-2">
                    Смотреть все товары
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Статистика */}
      <StatsGrid
        stats={statsData}
        bgClassName="bg-green-600 dark:bg-green-700"
        textColor="text-white"
      />

      {/* Отзывы */}
      <TestimonialsSection
        title="Что говорят наши клиенты"
        description="Более 1000 довольных садоводов доверяют нам"
        testimonials={testimonials}
      />

      {/* Призыв к действию */}
      <CTASection
        title="Готовы создать сад своей мечты?"
        description="Присоединяйтесь к тысячам довольных садоводов и начните свое садовое путешествие уже сегодня!"
        primaryAction={{
          label: "Начать покупки",
          href: "/catalog",
          icon: ArrowRight,
        }}
        secondaryAction={{
          label: "Создать аккаунт",
          href: "/register",
          icon: Users,
        }}
      />
    </main>
  );
}
