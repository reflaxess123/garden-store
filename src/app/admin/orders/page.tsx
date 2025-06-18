"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2 } from "lucide-react";
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
import { Label } from "@/shared/ui/label";
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
  AdminOrder,
  getAdminOrders,
  updateAdminOrder,
  UpdateOrderPayload,
} from "@/entities/order/admin-api";
import { formatPrice } from "@/shared/lib/utils";

// Zod schema for order status update validation
const orderStatusSchema = z.object({
  status: z.string().min(1, "Статус обязателен."),
});

type OrderStatusValues = z.infer<typeof orderStatusSchema>;

interface OrderDetailsDialogProps {
  order: AdminOrder;
  onSuccess: () => void;
  children: React.ReactNode;
}

function OrderDetailsDialog({
  order,
  onSuccess,
  children,
}: OrderDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<OrderStatusValues>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: order.status,
    },
  });

  const {
    mutate: updateMutate,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: (data: { id: string; payload: UpdateOrderPayload }) =>
      updateAdminOrder(data.id, data.payload),
    onSuccess: () => {
      toast.success("Статус заказа успешно обновлен!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Ошибка при обновлении статуса заказа: ${error.message}`);
    },
  });

  const onSubmit = (values: OrderStatusValues) => {
    updateMutate({
      id: order.id,
      payload: { status: values.status },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Детали заказа #{order.id.substring(0, 8)}...
          </DialogTitle>
          <DialogDescription>
            Просмотр и обновление статуса заказа.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>ID Заказа:</Label>
            <p className="font-medium">{order.id}</p>
          </div>
          <div>
            <Label>Пользователь:</Label>
            <p className="font-medium">{order.user?.email || "N/A"}</p>
          </div>
          <div>
            <Label>Дата заказа:</Label>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Label>Итоговая сумма:</Label>
            <p className="font-medium">{formatPrice(order.total)}</p>
          </div>

          <h3 className="text-lg font-semibold mt-4">Позиции заказа:</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Цена за ед.</TableHead>
                <TableHead>Всего</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItem.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    В этом заказе нет товаров.
                  </TableCell>
                </TableRow>
              ) : (
                order.orderItem.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name || "N/A"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPrice(item.priceSnapshot)}</TableCell>
                    <TableCell>
                      {formatPrice(item.priceSnapshot * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус заказа</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">В ожидании</SelectItem>
                      <SelectItem value="processing">В обработке</SelectItem>
                      <SelectItem value="shipped">Отправлен</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                      <SelectItem value="cancelled">Отменен</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Обновить статус
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery<AdminOrder[]>({
    queryKey: ["adminOrders"],
    queryFn: getAdminOrders,
  });

  const handleSuccess = () => {
    // Invalidate queries will refetch
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Загрузка заказов...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 min-h-[calc(100vh-140px)] flex items-center justify-center">
        Ошибка загрузки заказов: {error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление заказами</h1>
        {/* <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить заказ (обычно не делается через админ-панель)
        </Button> */}
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Нет доступных заказов.
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Заказа</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{order.user?.email || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell className="text-right">
                    <OrderDetailsDialog order={order} onSuccess={handleSuccess}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </OrderDetailsDialog>
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
