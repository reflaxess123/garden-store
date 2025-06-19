import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ProductsByCategoryProps {
  params: {
    "category-slug": string;
  };
}

export async function GET(
  request: Request,
  { params }: ProductsByCategoryProps
) {
  try {
    const categorySlug = (await params)["category-slug"];

    const response = await fetch(
      `${API_BASE_URL}/api/products/category/${categorySlug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("Category not found", { status: 404 });
      }
      const errorText = await response.text();
      console.error("Error fetching products by category:", errorText);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
