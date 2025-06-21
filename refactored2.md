# Рефакторинг админской структуры в соответствии с FSD

## Проблема

Изначальная структура админских компонентов в `@/shared/components/admin` **не соответствовала принципам Feature-Sliced Design (FSD)**:

1. **Нарушение принципа Shared слоя** - shared должен содержать только компоненты, используемые во всем приложении, а не привязанные к конкретному домену
2. **Смешение уровней ответственности** - общие компоненты (`DataTable`, `ActionButtons`) лежали рядом со специфичными (`ProductFormModal`, `OrderEditModal`)
3. **Отсутствие доменного разделения** - все админские компоненты были в одной папке

## Решение

Выполнен полный рефакторинг структуры в соответствии с принципами FSD:

### Старая структура (❌ Неправильно)

```
front/src/shared/components/admin/
├── index.ts                      # Общий экспорт всех компонентов
├── ActionButtons.tsx            # Общий компонент
├── DataTable.tsx               # Общий компонент
├── FilterPanel.tsx             # Общий компонент
├── FormModal.tsx               # Общий компонент
├── Pagination.tsx              # Общий компонент
├── SearchInput.tsx             # Общий компонент
├── StatsCards.tsx              # Общий компонент
├── StatusBadge.tsx             # Общий компонент
├── ViewModeToggle.tsx          # Общий компонент
├── ConfirmDialog.tsx           # Общий компонент
├── products/
│   └── ProductFormModal.tsx    # Специфичный для продуктов
└── orders/
    └── OrderEditModal.tsx      # Специфичный для заказов
```

### Новая структура (✅ Правильно)

```
front/src/features/
├── admin-common/               # Общие админские фичи
│   └── ui/
│       ├── index.ts           # Экспорт общих компонентов
│       ├── ActionButtons.tsx  # Переиспользуемые кнопки действий
│       ├── DataTable.tsx      # Универсальная таблица данных
│       ├── FilterPanel.tsx    # Панель фильтров
│       ├── FormModal.tsx      # Универсальная модальная форма
│       ├── Pagination.tsx     # Компонент пагинации
│       ├── SearchInput.tsx    # Поле поиска
│       ├── StatsCards.tsx     # Карточки статистики
│       ├── StatusBadge.tsx    # Бейджи статусов
│       ├── ViewModeToggle.tsx # Переключатель режимов просмотра
│       └── ConfirmDialog.tsx  # Диалог подтверждения
├── admin-products/            # Фичи для работы с продуктами
│   └── ui/
│       ├── index.ts
│       └── ProductFormModal.tsx # Модальная форма продукта
└── admin-orders/              # Фичи для работы с заказами
    └── ui/
        ├── index.ts
        └── OrderEditModal.tsx  # Модальная форма редактирования заказа
```

## Выполненные изменения

### 1. Создание новой структуры папок

- `front/src/features/admin-common/ui/` - общие переиспользуемые компоненты для админки
- `front/src/features/admin-products/ui/` - компоненты для управления продуктами
- `front/src/features/admin-orders/ui/` - компоненты для управления заказами

### 2. Перемещение компонентов

**Общие компоненты** (перенесены в `admin-common/ui/`):

- ActionButtons.tsx - кнопки действий с предустановленными иконками
- ConfirmDialog.tsx - диалог подтверждения операций
- DataTable.tsx - универсальная таблица с сортировкой и пагинацией
- FilterPanel.tsx - панель фильтров с поиском
- FormModal.tsx - базовая модальная форма
- Pagination.tsx - компонент пагинации с настройками
- SearchInput.tsx - поле поиска с очисткой
- StatsCards.tsx - карточки статистики с трендами
- StatusBadge.tsx - бейджи статусов с иконками
- ViewModeToggle.tsx - переключатель таблица/плитка

**Специфичные компоненты**:

- ProductFormModal.tsx → `admin-products/ui/` - форма создания/редактирования продуктов
- OrderEditModal.tsx → `admin-orders/ui/` - форма редактирования заказов

### 3. Создание индексных файлов

Для каждой папки созданы index.ts файлы с правильными экспортами:

```typescript
// admin-common/ui/index.ts
export { default as ActionButtons } from "./ActionButtons";
export { default as DataTable } from "./DataTable";
// ... и так далее

// admin-products/ui/index.ts
export { default as ProductFormModal } from "./ProductFormModal";

// admin-orders/ui/index.ts
export { default as OrderEditModal } from "./OrderEditModal";
```

### 4. Обновление импортов

**До**:

```typescript
import {
  ActionButtons,
  DataTable,
  ProductFormModal,
  // ...
} from "@/shared/components/admin";
```

**После**:

```typescript
import {
  ActionButtons,
  DataTable,
  // ...
} from "@/features/admin-common/ui";

import { ProductFormModal } from "@/features/admin-products/ui";
```

### 5. Обновленные файлы

- `front/src/app/admin/products/page.tsx` - обновлены импорты
- `front/src/app/admin/orders/page.tsx` - обновлены импорты
- `front/src/features/admin-orders/ui/OrderEditModal.tsx` - исправлен импорт FormModal

### 6. Очистка

- Удалена вся старая структура `front/src/shared/components/admin/`
- Удален временный скрипт рефакторинга

## Преимущества новой структуры

### 1. Соответствие FSD принципам

- **Shared** теперь содержит только действительно общие компоненты
- **Features** содержат доменно-специфичную логику
- Четкое разделение по областям ответственности

### 2. Улучшенная масштабируемость

- Легко добавлять новые админские фичи (admin-categories, admin-users)
- Компоненты изолированы по доменам
- Переиспользуемые компоненты выделены отдельно

### 3. Лучшая читаемость кода

- Явные импорты показывают зависимости между доменами
- Структура папок отражает архитектуру приложения
- Отсутствие "божественных" компонентов

### 4. Упрощенное тестирование

- Каждый feature можно тестировать изолированно
- Мокирование зависимостей стало проще
- Четкие границы между компонентами

## Совместимость с App Router

Новая структура полностью совместима с Next.js App Router:

- Все компоненты помечены `"use client"` где необходимо
- Импорты используют алиасы TypeScript paths
- Нет зависимостей между features

## Заключение

Рефакторинг успешно завершен. Структура админских компонентов теперь:

- ✅ Соответствует принципам FSD
- ✅ Масштабируется для больших проектов
- ✅ Обеспечивает четкое разделение ответственности
- ✅ Упрощает разработку и поддержку

Все импорты обновлены, старый код удален, новая структура готова к использованию.
