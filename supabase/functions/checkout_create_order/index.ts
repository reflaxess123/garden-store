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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all origins for development
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all origins for development
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders, // Apply CORS headers
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }, // Apply CORS headers
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
          headers: { ...corsHeaders, "Content-Type": "application/json" }, // Apply CORS headers
        }
      );
    }

    const userId = userAuth.user.id;

    // Parse request body for order details
    const {
      fullName,
      email,
      address,
      city,
      postalCode,
      phone,
      orderItems,
      totalAmount,
    } = await req.json();

    if (
      !fullName ||
      !email ||
      !address ||
      !city ||
      !postalCode ||
      !phone ||
      !orderItems ||
      !totalAmount
    ) {
      return new Response(
        JSON.stringify({ error: "Missing order details in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }, // Apply CORS headers
        }
      );
    }

    // Call the PostgreSQL RPC function to create the order
    const { data: orderResult, error: rpcError } = await supabase.rpc(
      "create_order",
      {
        p_address: address,
        p_city: city,
        p_email: email,
        p_full_name: fullName,
        p_order_items: orderItems,
        p_phone: phone,
        p_postal_code: postalCode,
        p_total_amount: totalAmount,
        p_user_id: userId,
      }
    );

    if (rpcError) {
      console.error(
        "Error calling create_order RPC from Edge Function:",
        rpcError.message,
        rpcError.details,
        rpcError.hint
      );
      return new Response(
        JSON.stringify({
          error: "Failed to create order",
          details: rpcError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }, // Apply CORS headers
        }
      );
    }

    return new Response(JSON.stringify({ orderId: orderResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }, // Apply CORS headers
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Unexpected error in Edge Function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }, // Apply CORS headers
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
