import { NextRequest, NextResponse } from "next/server";
import { logApiRequest, logError } from "../../_utils/logger";


export async function POST(request: NextRequest) {
  try {
    logApiRequest("POST", "/api/auth/signin");

    const { email, password } = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("Error signing in", null, {
        endpoint: "/auth/signin",
        status: response.status,
        errorText,
        email,
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Создаем ответ с токеном в cookie
    const nextResponse = NextResponse.json(data);

    if (data.access_token) {
      nextResponse.cookies.set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });
    }

    return nextResponse;
  } catch (error) {
    logError("Error signing in", error, {
      endpoint: "/auth/signin",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
