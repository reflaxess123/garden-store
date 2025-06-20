import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ "category-slug": string }> }
) {
  try {
    const { "category-slug": categorySlug } = await params;
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const searchQuery = searchParams.get("searchQuery");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const categoryFilter = searchParams.get("categoryFilter");
    const inStock = searchParams.get("inStock");
    const hasDiscount = searchParams.get("hasDiscount");

    // Проверяем наличие BACKEND_URL
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL environment variable is not set");
      return NextResponse.json(
        { error: "Backend configuration error" },
        { status: 500 }
      );
    }

    // Строим URL для backend
    const backendParams = new URLSearchParams({
      limit,
      offset,
    });

    if (searchQuery) backendParams.append("searchQuery", searchQuery);
    if (sortBy) backendParams.append("sortBy", sortBy);
    if (sortOrder) backendParams.append("sortOrder", sortOrder);
    if (minPrice) backendParams.append("minPrice", minPrice);
    if (maxPrice) backendParams.append("maxPrice", maxPrice);
    if (categoryFilter) backendParams.append("categoryFilter", categoryFilter);
    if (inStock) backendParams.append("inStock", inStock);
    if (hasDiscount) backendParams.append("hasDiscount", hasDiscount);

    const fullBackendUrl = `${backendUrl}/api/products/category/${categorySlug}?${backendParams.toString()}`;
    const response = await fetch(fullBackendUrl);

    if (!response.ok) {
      console.error(`Backend responded with status: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: response.status }
      );
    }

    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
