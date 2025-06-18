import { createSupabaseServerClient } from "@/shared/api/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    if (slug === "all") {
      return NextResponse.json(null);
    }
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, imageUrl")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching category by slug:", error);
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, imageUrl");

    if (error) {
      console.error("Error fetching all categories:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }
}
