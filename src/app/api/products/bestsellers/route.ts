import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bestsellers = await prisma.product.findMany({
      orderBy: {
        timesOrdered: "desc",
      },
      take: 10, // Получаем топ-10 хитов продаж
    });
    console.log("Bestsellers data from API (route handler):", bestsellers);
    return NextResponse.json(bestsellers);
  } catch (e: unknown) {
    console.error("Error fetching bestsellers:", e);
    return NextResponse.json(
      {
        error: "Failed to fetch bestsellers",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
