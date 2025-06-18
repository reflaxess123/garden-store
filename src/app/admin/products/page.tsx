"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";
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
  AdminProduct,
  createAdminProduct,
  CreateProductPayload,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  UpdateProductPayload,
} from "@/entities/product/admin-api";
import { formatPrice } from "@/shared/lib/utils";
import { Textarea } from "@/shared/ui/textarea";
import Image from "next/image";

// Zod schema for product form validation
const productFormSchema = z.object({
  name: z.string().min(1, "Имя продукта обязательно."),
  slug: z.string().min(1, "Slug продукта обязателен."),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0.01, "Цена должна быть больше 0."),
  discount: z.coerce.number().min(0).optional().or(z.literal("")),
  characteristics: z.string().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .url("Неверный формат URL изображения.")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Категория обязательна."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  product?: AdminProduct; // Optional for editing
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
      slug: product?.slug || "",
      description: product?.description || "",
      price: product?.price || 0,
      discount: product?.discount || 0,
      characteristics: JSON.stringify(product?.characteristics, null, 2) || "",
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
    const characteristicsParsed = values.characteristics
      ? JSON.parse(values.characteristics)
      : null;
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      price: values.price,
      discount: values.discount || null,
      characteristics: characteristicsParsed,
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug-продукта" {...field} />
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
                  <FormLabel>Характеристики (JSON)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="{'цвет': 'красный'}" {...field} />
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

export default function AdminProductsPage() {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery<AdminProduct[]>({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  const handleSuccess = () => {
    // Optionally refetch or re-validate if needed, useQueryClient.invalidateQueries handles this
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Загрузка продуктов...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 min-h-[calc(100vh-140px)] flex items-center justify-center">
        Ошибка загрузки продуктов: {error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление продуктами</h1>
        <ProductFormDialog onSuccess={handleSuccess}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить продукт
          </Button>
        </ProductFormDialog>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Нет доступных продуктов. Создайте первый!
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Изображение</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Заказано раз</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover mr-2 inline-block"
                      />
                    )}
                    {product.name}
                  </TableCell>
                  <TableCell>{product.slug}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.timesOrdered}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <ProductFormDialog
                        product={product}
                        onSuccess={handleSuccess}
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
