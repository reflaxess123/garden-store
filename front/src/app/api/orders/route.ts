import { NextRequest, NextResponse } from "next/server";
import { handleApiError, logApiRequest, logError } from "../_utils/logger";

interface OrderItemInput {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
}

export async function DELETE(request: NextRequest) {
  try {
    logApiRequest("DELETE", "/api/orders");

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/orders/${orderId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to delete order", null, {
        endpoint: `/orders/${orderId}`,
        status: response.status,
        errorText,
        orderId,
      });
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/orders",
      method: "DELETE",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    logApiRequest("POST", "/api/orders");

    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to create order", null, {
        endpoint: "/orders",
        status: response.status,
        errorText,
        orderTotal: body.total,
      });
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/orders",
      method: "POST",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
