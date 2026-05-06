import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Creates a Razorpay Order (server-side Basic Auth).
 * Fixes browser "Sign in to api.razorpay.com" prompts caused by client-side API challenges.
 *
 * Secrets (Supabase Dashboard → Edge Functions → Secrets, or CLI):
 *   RAZORPAY_KEY_ID     — same mode as frontend VITE_RAZORPAY_KEY_ID (test/live)
 *   RAZORPAY_KEY_SECRET — never expose to Vite / browser
 *
 * Deploy: supabase functions deploy create-razorpay-order
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_AMOUNTS = new Set([49900, 89900]);

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body: { amount?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || !ALLOWED_AMOUNTS.has(amount)) {
    return json({ error: "Invalid amount" }, 400);
  }

  const keyId = Deno.env.get("RAZORPAY_KEY_ID")?.trim();
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")?.trim();
  if (!keyId || !keySecret) {
    console.error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
    return json({ error: "Payments not configured on server" }, 500);
  }

  const basic = btoa(`${keyId}:${keySecret}`);
  const receipt = `rb_${user.id.replace(/-/g, "").slice(0, 12)}_${Date.now()}`;

  const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt,
    }),
  });

  const orderJson = (await orderRes.json()) as Record<string, unknown>;

  if (!orderRes.ok) {
    console.error("Razorpay order error", orderRes.status, orderJson);
    let desc = "Could not create order";
    const errField = orderJson.error;
    if (errField && typeof errField === "object" && errField !== null) {
      const d = (errField as { description?: unknown }).description;
      if (typeof d === "string") desc = d;
    }
    if (desc === "Could not create order" && typeof orderJson.message === "string") {
      desc = orderJson.message;
    }
    return json({ error: desc }, 502);
  }

  const orderId = orderJson.id;
  if (typeof orderId !== "string") {
    return json({ error: "Invalid Razorpay response" }, 502);
  }

  return json({ order_id: orderId });
});
