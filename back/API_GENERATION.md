# Генерация API клиента для фронта

Этот проект содержит автоматическую генерацию TypeScript клиента из FastAPI бэкенда.

## Быстрый старт

```bash
cd back
python generate_all.py
```

## Что генерируется

### 1. OpenAPI схема

- **Файл:** `back/openapi.json`
- **Описание:** JSON схема всех эндпоинтов API

### 2. TypeScript типы

- **Файл:** `front/src/shared/api/generated/types.ts`
- **Описание:** Типы данных для всех моделей API

### 3. API клиент

- **Файл:** `front/src/shared/api/generated/api-client.ts`
- **Описание:** Функции для вызова API и React Query хуки

### 4. Индекс

- **Файл:** `front/src/shared/api/generated/index.ts`
- **Описание:** Экспорт всех типов и функций

## Использование на фронте

### Импорт

```typescript
import {
  useGetProducts,
  usePostAuthSignin,
  ProductInDB,
  SignInSchema,
} from "@/shared/api/generated";
```

### GET запросы (с React Query)

```typescript
function ProductsList() {
  const { data: products, isLoading } = useGetProducts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### POST/PUT/DELETE запросы (мутации)

```typescript
function SignInForm() {
  const signInMutation = usePostAuthSignin();

  const handleSubmit = (data: SignInSchema) => {
    signInMutation.mutate(data, {
      onSuccess: (token) => {
        console.log("Signed in:", token);
      },
      onError: (error) => {
        console.error("Sign in failed:", error);
      },
    });
  };

  return <form onSubmit={handleSubmit}>{/* форма */}</form>;
}
```

### Параметры запросов

```typescript
// Для эндпоинтов с параметрами пути
const { data: product } = useGetProductBySlug("apple-iphone");

// Для эндпоинтов с query параметрами
const { data: products } = useGetProducts({
  params: { limit: 10, category: "electronics" },
});
```

## Отдельные скрипты

### Генерация только OpenAPI схемы

```bash
python generate_openapi.py
```

### Генерация только клиента

```bash
python generate_client.py
```

## Структура файлов

```
back/
├── generate_all.py          # Главный скрипт
├── generate_openapi.py      # Генерация OpenAPI схемы
├── generate_client.py       # Генерация TS клиента
├── openapi.json            # Сгенерированная схема
└── API_GENERATION.md       # Эта документация

front/src/shared/api/generated/
├── index.ts                # Экспорт всех типов
├── types.ts               # TypeScript типы
└── api-client.ts          # API клиент с хуками
```

## Особенности

- **Автоматическая типизация:** Все типы генерируются из Pydantic схем
- **TanStack Query интеграция:** Готовые хуки для всех эндпоинтов
- **Cookie авторизация:** Поддержка авторизации через cookies
- **Обработка ошибок:** Автоматическое проброс ошибок HTTP
- **Инвалидация кэша:** Автоматическая инвалидация после мутаций

## Переменные окружения

Добавьте в `.env.local` фронта:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Советы

1. **Регенерация:** Запускайте `generate_all.py` после изменений в API
2. **Типы:** Используйте сгенерированные типы везде для type safety
3. **Хуки:** Предпочитайте сгенерированные хуки прямым fetch вызовам
4. **Кастомизация:** Не редактируйте сгенерированные файлы вручную

## Обновление

После изменений в бэкенде:

```bash
cd back
python generate_all.py
```

Это обновит все типы и клиент автоматически.
