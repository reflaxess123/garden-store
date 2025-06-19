import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/shared/api/supabaseClient";
import { prisma } from "@/shared/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем, является ли пользователь администратором
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: userData, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("isAdmin")
      .eq("id", user.id)
      .single();

    if (adminError || !userData?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        orderItems: true, // Включаем связанные позиции заказа
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (e: unknown) {
    console.error("Error fetching admin orders:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
