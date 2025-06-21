import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logApiRequest("GET", `/api/products/${params.id}`);

    const response = await fetch(
      `${process.env.BACKEND_URL}/products/${params.id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch product", null, {
        endpoint: `/products/${params.id}`,
        status: response.status,
        errorText,
        productId: params.id,
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
      endpoint: `/products/${params.id}`,
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
