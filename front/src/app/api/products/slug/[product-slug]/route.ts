import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  logApiRequest,
  logError,
} from "../../../_utils/logger";


interface ProductBySlugProps {
  params: Promise<{
    "product-slug": string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { "product-slug": string } }
) {
  try {
    logApiRequest("GET", `/api/products/slug/${params["product-slug"]}`);

    const response = await fetch(
      `${process.env.BACKEND_URL}/products/slug/${params["product-slug"]}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("Failed to fetch product by slug", null, {
        endpoint: `/products/slug/${params["product-slug"]}`,
        status: response.status,
        errorText,
        slug: params["product-slug"],
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
      endpoint: `/products/slug/${params["product-slug"]}`,
      method: "GET",
    });
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
