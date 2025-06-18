import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/shared/api/supabaseClient";
import { prisma } from "@/shared/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CategoryRouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, context: CategoryRouteContext) {
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

    const updatedCategory = await prisma.category.update({
      where: {
        id: id,
      },
      data: body,
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (e: unknown) {
    console.error("Error updating category:", e);
    return NextResponse.json(
      {
        error: "Failed to update category",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: CategoryRouteContext) {
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

    await prisma.category.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error deleting category:", e);
    return NextResponse.json(
      {
        error: "Failed to delete category",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
