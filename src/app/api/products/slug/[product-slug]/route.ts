import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";

interface ProductBySlugProps {
  params: {
    "product-slug": string;
  };
}

export async function GET(request: Request, { params }: ProductBySlugProps) {
  try {
    const productSlug = (await params)["product-slug"];

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const productToSend = {
      ...product,
      price: product.price.toNumber(),
      discount: product.discount ? product.discount.toNumber() : null,
    };

    return NextResponse.json(productToSend);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
