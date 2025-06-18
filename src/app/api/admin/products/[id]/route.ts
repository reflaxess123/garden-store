import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/shared/api/supabaseClient";
import { prisma } from "@/shared/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface ProductRouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: ProductRouteContext) {
  try {
    const { id } = context.params;

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

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productSerialized = {
      ...product,
      price: product.price.toString(),
      discount: product.discount?.toString() || null,
    };

    return NextResponse.json(productSerialized);
  } catch (e: unknown) {
    console.error("Error fetching product:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: ProductRouteContext) {
  try {
    const { id } = context.params;

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

    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error deleting product:", e);
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: ProductRouteContext) {
  try {
    const { id } = context.params;
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

    const updateData: Record<string, any> = { ...body };

    if (updateData.price !== undefined && updateData.price !== null) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.discount !== undefined && updateData.discount !== null) {
      updateData.discount = parseFloat(updateData.discount);
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(
      {
        ...updatedProduct,
        price: updatedProduct.price.toString(),
        discount: updatedProduct.discount?.toString() || null,
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error updating product:", e);
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
