"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash } from "lucide-react";
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
import { Textarea } from "@/shared/ui/textarea";

import {
  AdminCategory,
  getAdminCategories,
} from "@/entities/category/admin-api";
import {
  AdminProductClient,
  createAdminProduct,
  CreateProductPayload,
  updateAdminProduct,
  UpdateProductPayload,
} from "@/entities/product/admin-api";
import { generateSlug } from "@/shared";

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

    if (oldKey !== key) {
      delete newCharacteristics[oldKey];
    }

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
  price: z.string().min(1, "Цена обязательна."),
  discount: z.string().optional().or(z.literal("")),
  characteristics: z.record(z.string()).optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Категория обязательна."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export interface ProductFormModalProps {
  product: AdminProductClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ProductFormModal({
  product,
  open,
  onOpenChange,
  onSuccess,
}: ProductFormModalProps) {
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
      price: product?.price || "",
      discount: product?.discount || "",
      characteristics: product?.characteristics || {},
      imageUrl: product?.imageUrl || "",
      categoryId: product?.categoryId || "",
    },
  });

  // Мутация для создания продукта
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => createAdminProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Продукт успешно создан!");
      form.reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Ошибка при создании продукта"
      );
    },
  });

  // Мутация для обновления продукта
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProductPayload) =>
      updateAdminProduct(product!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Продукт успешно обновлен!");
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Ошибка при обновлении продукта"
      );
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || "",
      price: values.price,
      discount: values.discount || "",
      characteristics: values.characteristics || {},
      imageUrl: values.imageUrl || "",
      categoryId: values.categoryId,
      slug: generateSlug(values.name),
    };

    if (product) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Редактировать продукт" : "Создать продукт"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Измените информацию о продукте."
              : "Заполните форму для создания нового продукта."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название продукта</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название продукта" {...field} />
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
                    <Textarea
                      placeholder="Введите описание продукта"
                      {...field}
                    />
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
                    <FormLabel>Цена (₽)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
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
                    <FormLabel>Скидка (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <SelectItem value="" disabled>
                          Загрузка...
                        </SelectItem>
                      ) : isCategoriesError ? (
                        <SelectItem value="" disabled>
                          Ошибка загрузки категорий
                        </SelectItem>
                      ) : (
                        categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? "Обновить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
