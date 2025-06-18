import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

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
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const searchQuery = searchParams.get("searchQuery");

    const where: Prisma.ProductWhereInput = {};
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    if (categorySlug !== "all") {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        return new NextResponse("Category not found", { status: 404 });
      }
      where.categoryId = category.id;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy,
    });

    const productsToSend = products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      discount: product.discount ? product.discount.toNumber() : null,
    }));

    return NextResponse.json(productsToSend);
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
