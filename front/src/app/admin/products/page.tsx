"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Trash,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import {
  AdminCategory,
  getAdminCategories,
} from "@/entities/category/admin-api";
import {
  AdminProductClient,
  createAdminProduct,
  CreateProductPayload,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  UpdateProductPayload,
} from "@/entities/product/admin-api";
import { getBestsellers, Product } from "@/entities/product/api";
import { formatPrice, generateSlug } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";
import Image from "next/image";

// Компонент для редактирования характеристик
interface CharacteristicsEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

function CharacteristicsEditor({
  value,
  onChange,
}: CharacteristicsEditorProps) {
  const characteristics = Object.entries(value || {});

  const addCharacteristic = () => {
    onChange({ ...value, "": "" });
  };

  const updateCharacteristic = (index: number, key: string, val: string) => {
    const newCharacteristics = { ...value };
    const oldKey = characteristics[index][0];

    // Удаляем старый ключ если он изменился
    if (oldKey !== key) {
      delete newCharacteristics[oldKey];
    }

    // Добавляем новый ключ-значение
    if (key.trim()) {
      newCharacteristics[key] = val;
    }

    onChange(newCharacteristics);
  };

  const removeCharacteristic = (index: number) => {
    const newCharacteristics = { ...value };
    const keyToRemove = characteristics[index][0];
    delete newCharacteristics[keyToRemove];
    onChange(newCharacteristics);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCharacteristic}
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить
        </Button>
      </div>

      {characteristics.map(([key, val], index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Название характеристики"
            value={key}
            onChange={(e) => updateCharacteristic(index, e.target.value, val)}
            className="flex-1"
          />
          <Input
            placeholder="Значение"
            value={val}
            onChange={(e) => updateCharacteristic(index, key, e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeCharacteristic(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {characteristics.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Нет характеристик. Нажмите &quot;Добавить&quot; чтобы добавить
          характеристику.
        </p>
      )}
    </div>
  );
}

// Zod schema for product form validation
const productFormSchema = z.object({
  name: z.string().min(1, "Имя продукта обязательно."),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0.01, "Цена должна быть больше 0."),
  discount: z.coerce.number().min(0).optional().or(z.literal("")),
  characteristics: z.record(z.string()).optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Категория обязательна."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  product: AdminProductClient | null; // Optional for editing
  onSuccess: () => void;
  children: React.ReactNode; // Trigger button
}

function ProductFormDialog({
  product,
  onSuccess,
  children,
}: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useQuery<AdminCategory[]>({
    queryKey: ["adminCategories"],
    queryFn: getAdminCategories,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price ? parseFloat(product.price) : 0,
      discount: product?.discount ? parseFloat(product.discount) : 0,
      characteristics: product?.characteristics || {},
      imageUrl: product?.imageUrl || "",
      categoryId: product?.categoryId || "",
    },
  });

  const {
    mutate: createMutate,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (data: CreateProductPayload) => createAdminProduct(data),
    onSuccess: () => {
      toast.success("Продукт успешно создан!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при создании продукта: ${error.message}`);
    },
  });

  const {
    mutate: updateMutate,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: (data: { id: string; payload: UpdateProductPayload }) =>
      updateAdminProduct(data.id, data.payload),
    onSuccess: () => {
      toast.success("Продукт успешно обновлен!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении продукта: ${error.message}`);
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    const slug = generateSlug(values.name);

    const payload = {
      name: values.name,
      slug: slug,
      description: values.description || null,
      price: values.price.toString(),
      discount: values.discount ? values.discount.toString() : null,
      characteristics: values.characteristics || null,
      imageUrl: values.imageUrl || null,
      categoryId: values.categoryId,
    };

    if (product) {
      updateMutate({
        id: product.id,
        payload: payload,
      });
    } else {
      createMutate(payload);
    }
  };

  const isLoading = isCreating || isUpdating || isLoadingCategories;

  if (isCategoriesError) {
    return <p className="text-red-500">Ошибка загрузки категорий.</p>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Редактировать" : "Создать"} продукт
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Внесите изменения в продукт."
              : "Создайте новый продукт."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Название продукта" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Описание продукта" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Скидка</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="characteristics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Характеристики</FormLabel>
                  <FormControl>
                    <CharacteristicsEditor
                      value={field.value || {}}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL изображения</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? "Сохранить изменения" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProductDialogProps {
  productId: string;
  onSuccess: () => void;
  children: React.ReactNode; // Trigger button
}

function DeleteProductDialog({
  productId,
  onSuccess,
  children,
}: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      toast.success("Продукт успешно удален!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении продукта: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вы уверены?</DialogTitle>
          <DialogDescription>
            Это действие невозможно отменить. Продукт будет удален безвозвратно.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutate(productId)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Компонент фильтров для админки
interface AdminFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearFilters: () => void;
  categories: AdminCategory[];
}

function AdminFilters({
  searchQuery,
  categoryFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
  categories,
}: AdminFiltersProps) {
  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || sortBy !== "default";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Поиск</label>
            <Input
              placeholder="Найти продукт..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Категория */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Категория</label>
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Сортировка */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Сортировка</label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger>
                <SelectValue placeholder="По умолчанию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">По умолчанию</SelectItem>
                <SelectItem value="name">По названию</SelectItem>
                <SelectItem value="price">По цене</SelectItem>
                <SelectItem value="timesOrdered">По популярности</SelectItem>
                <SelectItem value="createdAt">По дате создания</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Порядок сортировки */}
          {sortBy !== "default" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Порядок</label>
              <Select value={sortOrder} onValueChange={onSortOrderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">По возрастанию</SelectItem>
                  <SelectItem value="desc">По убыванию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Активные фильтры */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Активные фильтры:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Поиск: &quot;{searchQuery}&quot;
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onSearchChange("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Категория:{" "}
                  {categories.find((c) => c.id === categoryFilter)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onCategoryChange("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {sortBy !== "default" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Сортировка:{" "}
                  {sortBy === "name"
                    ? "название"
                    : sortBy === "price"
                    ? "цена"
                    : sortBy === "timesOrdered"
                    ? "популярность"
                    : "дата"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onSortByChange("default")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Компонент модалки с популярными товарами и графиком
interface PopularProductsModalProps {
  products: Product[];
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PopularProductsModal({
  products,
  isLoading,
  open,
  onOpenChange,
}: PopularProductsModalProps) {
  // Данные для простого графика
  const chartData = useMemo(() => {
    return products.slice(0, 10).map((product, index) => ({
      name:
        product.name.length > 20
          ? product.name.substring(0, 20) + "..."
          : product.name,
      orders: product.timesOrdered || 0,
      price: parseFloat(product.price),
    }));
  }, [products]);

  const maxOrders = Math.max(...chartData.map((item) => item.orders), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Популярные товары
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl sm:max-w-7xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Аналитика популярных товаров
          </DialogTitle>
          <DialogDescription>
            Статистика самых заказываемых товаров с графиком продаж
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Загрузка данных...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Сводная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">
                    {products.reduce(
                      (sum, p) => sum + (p.timesOrdered || 0),
                      0
                    )}
                  </div>
                  <p className="text-sm text-primary/80 font-medium">
                    Всего заказов
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatPrice(
                      products.reduce(
                        (sum, p) =>
                          sum + parseFloat(p.price) * (p.timesOrdered || 0),
                        0
                      )
                    )}
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400/80 font-medium">
                    Общая выручка
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-violet-700 dark:text-violet-400">
                    {formatPrice(
                      products.reduce(
                        (sum, p) =>
                          sum + parseFloat(p.price) * (p.timesOrdered || 0),
                        0
                      ) /
                        Math.max(
                          products.reduce(
                            (sum, p) => sum + (p.timesOrdered || 0),
                            0
                          ),
                          1
                        )
                    )}
                  </div>
                  <p className="text-sm text-violet-600 dark:text-violet-400/80 font-medium">
                    Средний чек
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    {products.length}
                  </div>
                  <p className="text-sm text-amber-600 dark:text-amber-400/80 font-medium">
                    Товаров в топе
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Простой график */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">График заказов</h3>
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-48 text-sm font-medium" title={item.name}>
                      {item.name}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className="bg-primary h-8 rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3 shadow-sm"
                        style={{
                          width: `${Math.max(
                            (item.orders / maxOrders) * 100,
                            8
                          )}%`,
                          minWidth: "40px",
                        }}
                      >
                        <span className="text-sm text-primary-foreground font-semibold">
                          {item.orders}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <span className="text-sm text-muted-foreground">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {formatPrice(item.price * item.orders)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Детальная таблица */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Детальная статистика</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Изображение</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Цена</TableHead>
                      <TableHead className="text-right">Заказов</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.imageUrl && (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>{product.category?.name}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(parseFloat(product.price))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {product.timesOrdered || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatPrice(
                            parseFloat(product.price) *
                              (product.timesOrdered || 0)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Компонент пагинации
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Генерируем номера страниц для отображения
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Если страниц много, показываем с многоточиями
      if (currentPage <= 3) {
        // Начало списка
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Конец списка
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Середина
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Показано {startItem}-{endItem} из {totalItems}
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>на странице</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AdminProductClient | null>(null);

  // URL синхронизация для модалки популярных товаров
  const isPopularModalOpen = searchParams.get("showPopular") === "true";

  const handlePopularModalChange = (open: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (open) {
      params.set("showPopular", "true");
    } else {
      params.delete("showPopular");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Состояние фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");

  // Состояние пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data: products, isLoading } = useQuery<AdminProductClient[]>({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<
    AdminCategory[]
  >({
    queryKey: ["adminCategories"],
    queryFn: getAdminCategories,
  });

  const { data: bestsellers, isLoading: isLoadingBestsellers } = useQuery<
    Product[]
  >({
    queryKey: ["bestsellers"],
    queryFn: () => getBestsellers(20), // Увеличиваем количество для аналитики
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      toast.success("Продукт успешно удален!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["bestsellers"] });
    },
    onError: (error) => {
      toast.error(`Ошибка при удалении продукта: ${error.message}`);
    },
  });

  // Фильтрация, сортировка и пагинация продуктов
  const { filteredAndSortedProducts, paginatedProducts, totalPages } =
    useMemo(() => {
      if (!products)
        return {
          filteredAndSortedProducts: [],
          paginatedProducts: [],
          totalPages: 0,
        };

      let filtered = products;

      // Фильтрация по поиску
      if (searchQuery) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Фильтрация по категории
      if (categoryFilter !== "all") {
        filtered = filtered.filter(
          (product) => product.categoryId === categoryFilter
        );
      }

      // Сортировка
      if (sortBy !== "default") {
        filtered = [...filtered].sort((a, b) => {
          let aValue: any, bValue: any;

          switch (sortBy) {
            case "name":
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case "price":
              aValue = parseFloat(a.price);
              bValue = parseFloat(b.price);
              break;
            case "timesOrdered":
              aValue = a.timesOrdered || 0;
              bValue = b.timesOrdered || 0;
              break;
            case "createdAt":
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            default:
              return 0;
          }

          if (sortOrder === "desc") {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      // Пагинация
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = filtered.slice(startIndex, endIndex);

      return {
        filteredAndSortedProducts: filtered,
        paginatedProducts,
        totalPages,
      };
    }, [
      products,
      searchQuery,
      categoryFilter,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage,
    ]);

  const handleSuccess = () => {
    setEditingProduct(null);
    setIsNewProductDialogOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("default");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении количества элементов
  };

  // Сбрасываем страницу на первую при изменении фильтров
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Управление продуктами</h1>
        <p>Загрузка продуктов...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление продуктами</h1>
        <div className="flex gap-3">
          <PopularProductsModal
            products={bestsellers || []}
            isLoading={isLoadingBestsellers}
            open={isPopularModalOpen}
            onOpenChange={handlePopularModalChange}
          />
          <ProductFormDialog
            onSuccess={handleSuccess}
            product={editingProduct}
            key={editingProduct?.id || "new"}
          >
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="mr-2 h-4 w-4" /> Добавить продукт
            </Button>
          </ProductFormDialog>
        </div>
      </div>

      {/* Фильтры */}
      <AdminFilters
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={clearFilters}
        categories={categories}
      />

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Всего продуктов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredAndSortedProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">Отфильтровано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatPrice(
                filteredAndSortedProducts.reduce(
                  (sum, p) => sum + parseFloat(p.price),
                  0
                ) / Math.max(filteredAndSortedProducts.length, 1)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Средняя цена</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {filteredAndSortedProducts.reduce(
                (sum, p) => sum + (p.timesOrdered || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего заказов</p>
          </CardContent>
        </Card>
      </div>

      {/* Пагинация сверху */}
      {totalPages > 1 && (
        <Card className="mb-4">
          <CardContent className="py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={filteredAndSortedProducts.length}
            />
          </CardContent>
        </Card>
      )}

      {/* Таблица продуктов */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Изображение</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Заказано раз</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchQuery || categoryFilter !== "all"
                      ? "Нет продуктов, соответствующих фильтрам"
                      : "Нет продуктов"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>
                      {formatPrice(parseFloat(product.price))}
                    </TableCell>
                    <TableCell>
                      {product.discount
                        ? formatPrice(parseFloat(product.discount))
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.timesOrdered || 0}
                        {(product.timesOrdered || 0) > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Популярный
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <ProductFormDialog
                          onSuccess={handleSuccess}
                          product={product}
                        >
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </ProductFormDialog>
                        <DeleteProductDialog
                          productId={product.id}
                          onSuccess={handleSuccess}
                        >
                          <Button variant="destructive" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DeleteProductDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Пагинация снизу */}
      {totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={filteredAndSortedProducts.length}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
