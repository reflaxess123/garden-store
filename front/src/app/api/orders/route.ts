import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OrderItemInput {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl?: string | null;
}

interface CreateOrderRequestBody {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  orderItems: OrderItemInput[];
  totalAmount: number;
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error deleting order:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("Error deleting order:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating order:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("Error creating order:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
