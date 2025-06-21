"use client";

import { createOrder } from "@/entities/product/apiClient";
import { useCart } from "@/features/cart/hooks";
import { formatPrice, logger, notifications } from "@/shared";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов.",
  }),
  email: z.string().email({
    message: "Введите действительный адрес электронной почты.",
  }),
  address: z.string().min(5, {
    message: "Адрес должен содержать не менее 5 символов.",
  }),
  city: z.string().min(2, {
    message: "Город должен содержать не менее 2 символов.",
  }),
  postalCode: z.string().min(4, {
    message: "Почтовый индекс должен содержать не менее 4 символов.",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Телефон должен содержать не менее 10 символов.",
    })
    .max(15, {
      message: "Телефон должен содержать не более 15 символов.",
    }),
});

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) {
      toast.error("Ваша корзина пуста. Невозможно оформить заказ.");
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      name: item.name,
      imageUrl: item.imageUrl,
    }));

    try {
      const orderData = {
        fullName: values.fullName,
        email: values.email,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        phone: values.phone,
        items: orderItems,
        totalAmount: totalAmount,
      };

      const result = await createOrder(orderData);

      if (result && result.id) {
        clearCart();
        notifications.orders.created(result.id);
        router.push(`/orders/${result.id}`);
      }
    } catch (error) {
      logger.error("Ошибка при оформлении заказа", error, {
        component: "CheckoutPage",
        orderData: {
          fullName: values.fullName,
          email: values.email,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          phone: values.phone,
          items: orderItems,
          totalAmount: totalAmount,
        },
      });
      notifications.orders.error(error as Error);
    } finally {
      form.reset();
    }
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Оформление заказа</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Ваши данные</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Полное имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Ваше имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Электронная почта</FormLabel>
                    <FormControl>
                      <Input placeholder="ваша@почта.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 (XXX) XXX-XX-XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес доставки</FormLabel>
                    <FormControl>
                      <Input placeholder="Улица, дом, квартира" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город</FormLabel>
                    <FormControl>
                      <Input placeholder="Ваш город" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Почтовый индекс</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Ваш заказ</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Корзина пуста.</p>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
              {items.map((item) => (
                <div key={item.cartId} className="flex items-center space-x-4">
                  {item.imageUrl && (
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.priceSnapshot)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.quantity * item.priceSnapshot)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between font-bold text-xl mb-4">
              <span>Итого:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={form.handleSubmit(onSubmit)}
              disabled={items.length === 0 || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Оформление..." : "Оформить заказ"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
