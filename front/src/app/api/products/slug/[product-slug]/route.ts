import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  logApiRequest,
  logError,
} from "../../../_utils/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ "product-slug": string }> }
) {
  try {
    const { "product-slug": productSlug } = await params;
    logApiRequest("GET", `/api/products/slug/${productSlug}`);

    const response = await fetch(
      `${process.env.BACKEND_URL}/products/slug/${productSlug}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch product by slug", null, {
        endpoint: `/products/slug/${productSlug}`,
        status: response.status,
        errorText,
        slug: productSlug,
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
      endpoint: `/products/slug/[product-slug]`,
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
