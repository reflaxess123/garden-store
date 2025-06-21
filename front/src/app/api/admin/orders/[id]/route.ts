import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  logApiRequest,
  logError,
} from "../../../_utils/logger";

interface OrderRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, context: OrderRouteContext) {
  try {
    logApiRequest("PATCH", "/api/admin/orders/[id]");

    const { id } = await context.params;
    const body = await req.json();

    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/orders/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Error updating order", null, {
        endpoint: `/admin/orders/${id}`,
        status: response.status,
        errorText,
        orderId: id,
      });
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: response.status }
      );
    }

    const updatedOrder = await response.json();
    return NextResponse.json(updatedOrder);
  } catch (error) {
    const { error: errorMsg, status } = handleApiError(error, {
      endpoint: "/admin/orders/[id]",
      method: "PATCH",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
