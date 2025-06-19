import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ProductRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, context: ProductRouteContext) {
  try {
    const { id } = await context.params;

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching admin product:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const product = await response.json();
    return NextResponse.json(product);
  } catch (e: unknown) {
    console.error("Error fetching admin product:", e);
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
    const { id } = await context.params;

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error deleting product:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({}, { status: 204 });
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
    const { id } = await context.params;
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating product:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const updatedProduct = await response.json();
    return NextResponse.json(updatedProduct);
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
