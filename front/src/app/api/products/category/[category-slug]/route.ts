import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  logApiRequest,
  logError,
} from "../../../_utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: { "category-slug": string } }
) {
  try {
    logApiRequest("GET", `/api/products/category/${params["category-slug"]}`);

    if (!process.env.BACKEND_URL) {
      logError("BACKEND_URL environment variable is not set", null, {
        endpoint: `/products/category/${params["category-slug"]}`,
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const response = await fetch(
      `${process.env.BACKEND_URL}/products/category/${params["category-slug"]}?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      logError("Backend responded with error", null, {
        endpoint: `/products/category/${params["category-slug"]}`,
        status: response.status,
        categorySlug: params["category-slug"],
      });
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: `/products/category/${params["category-slug"]}`,
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
