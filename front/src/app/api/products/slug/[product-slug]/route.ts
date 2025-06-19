import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ProductBySlugProps {
  params: Promise<{
    "product-slug": string;
  }>;
}

export async function GET(request: Request, { params }: ProductBySlugProps) {
  try {
    const productSlug = (await params)["product-slug"];

    const response = await fetch(
      `${API_BASE_URL}/api/products/slug/${productSlug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("Product not found", { status: 404 });
      }
      const errorText = await response.text();
      console.error("Error fetching product by slug:", errorText);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const product = await response.json();
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
