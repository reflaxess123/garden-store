import { createSupabaseServerClient } from "@/shared/api/supabaseClient";
import { prisma } from "@/shared/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
  } catch (e: any) {
    console.error("Error deleting order:", e);
    return NextResponse.json(
      { error: "Server error", details: e.message || String(e) },
      { status: 500 }
    );
  }
}
