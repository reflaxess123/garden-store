import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";


export async function GET(request: NextRequest) {
  try {
    logApiRequest("GET", "/api/admin/orders");

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
    });

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/orders?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch orders", null, {
        endpoint: "/admin/orders",
        status: response.status,
        errorText,
        queryParams: Object.fromEntries(queryParams),
      });
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/orders",
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
