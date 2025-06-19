import { createSupabaseServerClient } from "@/shared/api/supabaseClient";
import { prisma } from "@/shared/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface OrderItemInput {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
}

interface CreateOrderRequestBody {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  orderItems: OrderItemInput[];
  totalAmount: number;
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }
    // Проверяем, что заказ принадлежит пользователю
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order || order.userId !== user.id) {
      return NextResponse.json(
        { error: "Not found or forbidden" },
        { status: 404 }
      );
    }
    // Сначала удаляем связанные order_items
    await prisma.orderItem.deleteMany({ where: { orderId } });
    // Потом сам заказ
    await prisma.order.delete({ where: { id: orderId } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("Error deleting order:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {
      fullName,
      email,
      address,
      city,
      postalCode,
      phone,
      orderItems,
      totalAmount,
    } = (await req.json()) as CreateOrderRequestBody;

    if (
      !fullName ||
      !email ||
      !address ||
      !city ||
      !postalCode ||
      !phone ||
      !orderItems ||
      !totalAmount
    ) {
      return NextResponse.json(
        { error: "Missing order details in request body" },
        { status: 400 }
      );
    }

    // Создаём заказ и связанные order_items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        fullName,
        email,
        address,
        city,
        postalCode,
        phone,
        totalAmount,
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
            name: item.name,
            imageUrl: item.imageUrl ?? null,
          })),
        },
      },
      include: { orderItems: true },
    });

    // Обновляем timesOrdered для каждого продукта
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { timesOrdered: (product.timesOrdered || 0) + item.quantity },
        });
      }
    }

    return NextResponse.json({ orderId: order.id });
  } catch (e: unknown) {
    console.error("Error creating order:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
