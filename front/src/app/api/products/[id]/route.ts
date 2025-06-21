import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logApiRequest("GET", `/api/products/${id}`);

    const response = await fetch(`${process.env.BACKEND_URL}/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch product", null, {
        endpoint: `/products/${id}`,
        status: response.status,
        errorText,
        productId: id,
      });
      return NextResponse.json(
        { error: "Product not found" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: `/products/[id]`,
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
