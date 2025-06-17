import { signInSchema } from "@/features/auth/model";
import { createSupabaseServerClient } from "@/shared/api/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const { email, password } = data;

  const parsed = signInSchema.safeParse({ email, password });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Неверный формат данных." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  // Возвращаем данные сессии при успешном входе
  return NextResponse.json({
    success: true,
    message: "Вы успешно вошли!",
    session: data.session,
  });
}
