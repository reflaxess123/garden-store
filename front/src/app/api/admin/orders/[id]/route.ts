import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating order:", errorText);

      // Пытаемся распарсить JSON ошибку
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.detail || errorJson.message || errorDetails;
      } catch (e) {
        // Если не JSON, используем текст как есть
        errorDetails = errorText || errorDetails;
      }

      return NextResponse.json(
        { error: "Failed to update order", details: errorDetails },
        { status: response.status }
      );
    }

    const updatedOrder = await response.json();
    return NextResponse.json(updatedOrder);
  } catch (e: unknown) {
    console.error("Error updating order:", e);
    return NextResponse.json(
      {
        error: "Failed to update order",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
