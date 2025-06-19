import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching admin orders:", errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const orders = await response.json();
    return NextResponse.json(orders);
  } catch (e: unknown) {
    console.error("Error fetching admin orders:", e);
    return NextResponse.json(
      {
        error: "Server error",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
