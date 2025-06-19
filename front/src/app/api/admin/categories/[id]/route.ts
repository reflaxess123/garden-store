import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface CategoryRouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(req: NextRequest, context: CategoryRouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating category:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const updatedCategory = await response.json();
    return NextResponse.json(updatedCategory);
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
    const { id } = await context.params;

    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error deleting category:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({}, { status: 204 });
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
