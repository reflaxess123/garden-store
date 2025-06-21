import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";


export async function GET(request: NextRequest) {
  try {
    logApiRequest("GET", "/api/admin/categories");

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch categories", null, {
        endpoint: "/admin/categories",
        status: response.status,
        errorText,
      });
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/categories",
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    logApiRequest("POST", "/api/admin/categories");

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/categories`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to create category", null, {
        endpoint: "/admin/categories",
        status: response.status,
        errorText,
        categoryName: body.name,
      });
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/categories",
      method: "POST",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
