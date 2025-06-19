import { createSupabaseServerClient } from "@/shared/api/supabaseClient";
import { prisma } from "@/shared/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface LocalCartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
}

export async function POST(req: NextRequest) {
  const { localCart } = (await req.json()) as { localCart: LocalCartItem[] };

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    for (const item of localCart) {
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          userId: userId,
          productId: item.productId,
        },
      });

      if (existingCartItem) {
        await prisma.cartItem.update({
          where: {
            id: existingCartItem.id,
          },
          data: {
            quantity: existingCartItem.quantity + item.quantity,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId: userId,
            productId: item.productId,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Cart merged successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error merging cart:", error);
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    );
  }
}
