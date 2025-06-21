import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../_utils/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    logApiRequest("GET", "/api/categories");

    let url = `${process.env.BACKEND_URL}/categories`;
    if (slug) {
      url += `?slug=${slug}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch categories", null, {
        endpoint: "/categories",
        status: response.status,
        errorText,
      });
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (slug) {
      if (slug === "all") {
        return NextResponse.json(null);
      }

      // Если запрос по slug, возвращаем один объект
      const category = Array.isArray(data) ? data[0] : data;

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/categories",
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
