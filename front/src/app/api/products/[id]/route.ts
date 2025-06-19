import { createSupabaseServerClient } from "@/shared/api/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
