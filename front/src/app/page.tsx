import { getAllCategories } from "@/entities/category/api";
import { CategoryCard } from "@/entities/category/ui/CategoryCard";
import { getBestsellers } from "@/entities/product/api";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  ArrowRight,
  Award,
  Headphones,
  Quote,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Компонент героической секции
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20 lg:py-32">
      <div className="absolute inset-0 bg-[url('/images/garden-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                🌱 Новая коллекция весна 2024
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Ваш сад — <span className="text-green-600">наша страсть</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Откройте мир садоводства с нашими качественными инструментами,
                семенами и горшками. Создайте сад своей мечты уже сегодня!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Link href="/catalog" className="flex items-center gap-2">
                  Начать покупки
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/catalog" className="flex items-center gap-2">
                  Смотреть каталог
                  <ShoppingBag className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-600">
                  1000+
                </div>
                <div className="text-sm text-gray-600">Довольных клиентов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-600">
                  500+
                </div>
                <div className="text-sm text-gray-600">Товаров в каталоге</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-600">
                  99%
                </div>
                <div className="text-sm text-gray-600">
                  Положительных отзывов
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/images/pots_category.jpg"
                alt="Садовые инструменты и растения"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
            {/* Декоративные элементы */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-200 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Компонент преимуществ
function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: "Быстрая доставка",
      description:
        "Доставим ваш заказ в течение 1-3 рабочих дней по всей России",
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

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Почему выбирают нас?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Мы создаем лучший опыт покупок для садоводов всех уровней
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-8">
                <div
                  className={`inline-flex p-4 rounded-full ${feature.bg} mb-6`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Компонент отзывов
function TestimonialsSection() {
  const testimonials = [
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Что говорят наши клиенты
          </h2>
          <p className="text-xl text-gray-600">
            Более 1000 довольных садоводов доверяют нам
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-green-600 mr-3" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Компонент статистики
function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "1,000+",
      label: "Довольных клиентов",
      color: "text-blue-600",
    },
    {
      icon: ShoppingBag,
      value: "5,000+",
      label: "Выполненных заказов",
      color: "text-green-600",
    },
    {
      icon: TrendingUp,
      value: "99%",
      label: "Положительных отзывов",
      color: "text-purple-600",
    },
    {
      icon: Award,
      value: "3",
      label: "Года на рынке",
      color: "text-orange-600",
    },
  ];

  return (
    <section className="py-20 bg-green-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <stat.icon className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <div className="text-4xl lg:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Компонент CTA
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Готовы создать сад своей мечты?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Присоединяйтесь к тысячам довольных садоводов и начните свое садовое
            путешествие уже сегодня!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/catalog" className="flex items-center gap-2">
                Начать покупки
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
            >
              <Link href="/register" className="flex items-center gap-2">
                Создать аккаунт
                <Users className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Отключаем статическую генерацию, т.к. нужны API вызовы
export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getAllCategories();
  const bestsellers = await getBestsellers(8); // Увеличиваем до 8 товаров

  return (
    <main className="min-h-screen">
      {/* Героическая секция */}
      <HeroSection />

      {/* Секция преимуществ */}
      <FeaturesSection />

      {/* Категории */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Наши категории
            </h2>
            <p className="text-xl text-gray-600">
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 mb-4">
              🔥 Популярные товары
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Хиты продаж
            </h2>
            <p className="text-xl text-gray-600">
              Самые популярные товары среди наших покупателей
            </p>
          </div>

          {bestsellers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-xl text-gray-600 mb-6">
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
      <StatsSection />

      {/* Отзывы */}
      <TestimonialsSection />

      {/* Призыв к действию */}
      <CTASection />
    </main>
  );
}
