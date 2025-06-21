import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../../_utils/logger";


interface LocalCartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
}

export async function POST(request: NextRequest) {
  try {
    logApiRequest("POST", "/api/cart/merge");

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/cart/merge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to merge cart", null, {
        endpoint: "/cart/merge",
        status: response.status,
        errorText,
        itemsCount: body.items?.length,
      });
      return NextResponse.json(
        { error: "Failed to merge cart" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/cart/merge",
      method: "POST",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
