import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";

export async function GET(request: NextRequest) {
  try {
    logApiRequest("GET", "/api/products/bestsellers");

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";

    const response = await fetch(
      `${process.env.BACKEND_URL}/products/bestsellers?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch bestsellers", null, {
        endpoint: "/products/bestsellers",
        status: response.status,
        errorText,
      });
      return NextResponse.json(
        { error: "Failed to fetch bestsellers" },
        { status: response.status }
      );
    }

    const bestsellers = await response.json();
    return NextResponse.json(bestsellers);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/products/bestsellers",
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
