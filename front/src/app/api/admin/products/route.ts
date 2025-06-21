import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";


export async function GET(request: NextRequest) {
  try {
    logApiRequest("GET", "/api/admin/products");

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category }),
    });

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/products?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch products", null, {
        endpoint: "/admin/products",
        status: response.status,
        errorText,
        queryParams: Object.fromEntries(queryParams),
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
      endpoint: "/admin/products",
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    logApiRequest("POST", "/api/admin/products");

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/admin/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to create product", null, {
        endpoint: "/admin/products",
        status: response.status,
        errorText,
        productName: body.name,
      });
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/products",
      method: "POST",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
