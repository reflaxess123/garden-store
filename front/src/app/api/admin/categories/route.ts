import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching admin categories:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const categories = await response.json();
    return NextResponse.json(categories);
  } catch (e: unknown) {
    console.error("Error fetching admin categories:", e);
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

    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating category:", errorText);

      // Пытаемся распарсить JSON ошибку
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.detail || errorJson.message || errorDetails;
      } catch (e) {
        // Если не JSON, используем текст как есть
        errorDetails = errorText || errorDetails;
      }

      return NextResponse.json(
        { error: "Failed to create category", details: errorDetails },
        { status: response.status }
      );
    }

    const newCategory = await response.json();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (e: unknown) {
    console.error("Error creating category:", e);
    return NextResponse.json(
      {
        error: "Failed to create category",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
