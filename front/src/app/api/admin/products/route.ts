import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching admin products:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const products = await response.json();
    return NextResponse.json(products);
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

    const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating product:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const newProduct = await response.json();
    return NextResponse.json(newProduct, { status: 201 });
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
