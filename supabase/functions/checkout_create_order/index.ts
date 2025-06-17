// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Functions!");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { userId, total, items } = await req.json();

  if (!userId || !total || !items) {
    return new Response("Missing required fields: userId, total, items", {
      status: 400,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Вставка нового заказа
    const { data: order, error: orderError } = await supabaseAdmin
      .from("Order")
      .insert({ userId, total, items })
      .select()
      .single();

    if (orderError) {
      console.error("Error inserting order:", orderError);
      return new Response(JSON.stringify({ error: orderError.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Очистка корзины пользователя
    const { error: cartError } = await supabaseAdmin
      .from("CartItem")
      .delete()
      .eq("userId", userId);

    if (cartError) {
      console.error("Error clearing cart:", cartError);
      // Мы можем вернуть успех создания заказа, но залогировать ошибку очистки корзины
    }

    return new Response(
      JSON.stringify({
        message: "Order created successfully",
        orderId: order.id,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error in Edge Function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/checkout_create_order' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
