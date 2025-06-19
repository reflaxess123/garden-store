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

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const productsSerialized = products.map((product) => ({
      ...product,
      price: product.price.toString(),
      discount: product.discount?.toString() || null,
    }));

    return NextResponse.json(productsSerialized);
  } catch (e: unknown) {
    console.error("Error fetching admin products:", e);
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
    const body = await req.json();

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

    const newProduct = await prisma.product.create({
      data: {
        ...body,
        price: parseFloat(body.price),
        discount: body.discount ? parseFloat(body.discount) : null,
      },
    });

    return NextResponse.json(
      {
        ...newProduct,
        price: newProduct.price.toString(),
        discount: newProduct.discount?.toString() || null,
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    console.error("Error creating product:", e);
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
