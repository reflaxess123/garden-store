/// <reference lib="deno.ns" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.3";

console.log("Hello from Functions!");

interface ProductSelectResult {
  name: string;
  imageUrl: string | null;
}

interface RawCartItemFromSupabase {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product: ProductSelectResult[]; // Ожидаем массив продукта
}

interface EdgeFunctionCartItem {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  imageUrl: string | null;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data: userAuth, error: authError } = await supabase.auth.getUser(
      token
    );
    if (authError || !userAuth.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = userAuth.user.id;

    // Fetch cart items (to pass to RPC, it's safer to fetch them server-side)
    const { data: cartItemsRaw, error: cartError } = await supabase
      .from("CartItem")
      .select(
        `id, productId, quantity, priceSnapshot, product:products(name, imageUrl)`
      ) // Note: product will be an array here
      .eq("userId", userId);

    if (cartError) {
      console.error("Error fetching cart items in Edge Function:", cartError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch cart items",
          details: cartError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!cartItemsRaw || cartItemsRaw.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cartItems: EdgeFunctionCartItem[] = (
      cartItemsRaw as RawCartItemFromSupabase[]
    ).map((item: RawCartItemFromSupabase) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      name: item.product[0]?.name || "Unknown",
      imageUrl: item.product[0]?.imageUrl || null,
    }));

    // Prepare items for RPC, ensuring correct structure and type casting for product details
    const orderItemsForRpc = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      name: item.name,
      imageUrl: item.imageUrl,
    }));

    // Call the PostgreSQL RPC function to create the order
    // The actual transaction logic (insert order, insert items, clear cart) will be in this RPC
    const { data: orderResult, error: rpcError } = await supabase.rpc(
      "create_order",
      {
        p_user_id: userId,
        p_cart_items: orderItemsForRpc,
      }
    );

    if (rpcError) {
      console.error(
        "Error calling create_order RPC from Edge Function:",
        rpcError
      );
      return new Response(
        JSON.stringify({
          error: "Failed to create order",
          details: rpcError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ orderId: orderResult }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Явно указываем unknown
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Unexpected error in Edge Function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
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
