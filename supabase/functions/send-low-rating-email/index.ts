/**
 * Sends owner alert via Brevo (Sendinblue) when a review has average ≤ 3.
 * Invoked from the public review page after insert (service role + BREVO_API_KEY).
 *
 * Secrets: BREVO_API_KEY (required), optional BREVO_SENDER_EMAIL / BREVO_SENDER_NAME,
 * optional PUBLIC_APP_URL (dashboard base).
 *
 * Do NOT put BREVO_API_KEY in VITE_* — it would ship to every browser.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ORANGE = "#f97316";

const DEFAULT_BREVO_SENDER_EMAIL = "pankajtiwari.model@gmail.com";
const DEFAULT_BREVO_SENDER_NAME = "ReviewBoost";

const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

type Body = {
  review_id?: string;
  dashboard_origin?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

function effectiveAverage(row: {
  overall_average: number | string | null;
  food_stars: number | null;
  service_stars: number | null;
  atmosphere_stars: number | null;
  stars: number;
}): number {
  if (row.overall_average != null && row.overall_average !== "") {
    const n = Number(row.overall_average);
    if (!Number.isNaN(n)) return n;
  }
  const f = row.food_stars;
  const s = row.service_stars;
  const a = row.atmosphere_stars;
  if (
    f != null &&
    s != null &&
    a != null &&
    f >= 1 &&
    f <= 5 &&
    s >= 1 &&
    s <= 5 &&
    a >= 1 &&
    a <= 5
  ) {
    return (f + s + a) / 3;
  }
  return row.stars;
}

function normalizeDashboardBase(raw: string | undefined, fallback: string): string {
  const t = (raw || fallback || "").trim().replace(/\/$/, "");
  if (!t) return "";
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

function buildHtml(params: {
  restaurantName: string;
  food: number;
  service: number;
  atmosphere: number;
  overall: string;
  feedbackHtml: string;
  whenLabel: string;
  dashboardUrl: string;
}): string {
  const {
    restaurantName,
    food,
    service,
    atmosphere,
    overall,
    feedbackHtml,
    whenLabel,
    dashboardUrl,
  } = params;

  const ctaRow = dashboardUrl
    ? `<tr>
            <td style="padding:0 28px 28px;text-align:center;">
              <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:${ORANGE};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">View Dashboard</a>
            </td>
          </tr>`
    : `<tr>
            <td style="padding:0 28px 28px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#57534e;">Sign in to your ReviewBoost dashboard to see details.</p>
            </td>
          </tr>`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;background:#fafaf9;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafaf9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);border:1px solid #e7e5e4;">
          <tr>
            <td style="background:${ORANGE};padding:24px 28px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">ReviewBoost</div>
              <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,.92);font-weight:600;">Venue feedback alerts</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#1c1917;">You received a low rating</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#57534e;">
                <strong style="color:#1c1917;">${escapeHtml(restaurantName)}</strong> just received feedback with an average at or below 3 stars.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 16px;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#78716c;">Rating breakdown</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.8;color:#44403c;">
                <tr><td style="padding:4px 0;">🍽️ Food:</td><td style="padding:4px 0 4px 12px;font-weight:700;">${food}/5</td></tr>
                <tr><td style="padding:4px 0;">👨‍🍳 Service:</td><td style="padding:4px 0 4px 12px;font-weight:700;">${service}/5</td></tr>
                <tr><td style="padding:4px 0;">✨ Atmosphere:</td><td style="padding:4px 0 4px 12px;font-weight:700;">${atmosphere}/5</td></tr>
                <tr><td style="padding:8px 0 4px 0;border-top:1px solid #e7e5e4;">⭐ Overall:</td><td style="padding:8px 0 4px 12px;border-top:1px solid #e7e5e4;font-weight:800;color:${ORANGE};">${overall}/5</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 16px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#78716c;">Customer feedback</p>
              <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.55;color:#44403c;">${feedbackHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;">
              <p style="margin:0;font-size:13px;color:#78716c;">Submitted: <strong style="color:#57534e;">${escapeHtml(whenLabel)}</strong></p>
            </td>
          </tr>
          ${ctaRow}
          <tr>
            <td style="padding:16px 28px 24px;background:#fafaf9;border-top:1px solid #e7e5e4;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#78716c;text-align:center;">
                This is a private notification.<br/>
                Customer feedback was NOT posted on Google.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const reviewId = body.review_id?.trim() ?? "";
  if (!isUuid(reviewId)) {
    return new Response(JSON.stringify({ error: "Invalid review_id" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const brevoKey = Deno.env.get("BREVO_API_KEY")?.trim();

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!brevoKey) {
    console.error("BREVO_API_KEY not set");
    return new Response(JSON.stringify({ error: "Email not configured" }), {
      status: 503,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: review, error: revErr } = await admin
    .from("reviews")
    .select(
      "id, created_at, stars, overall_average, food_stars, service_stars, atmosphere_stars, feedback, feedback_food, feedback_service, feedback_atmosphere, restaurant_id",
    )
    .eq("id", reviewId)
    .maybeSingle();

  if (revErr || !review) {
    console.error("Review fetch failed", revErr);
    return new Response(JSON.stringify({ error: "Review not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const created = new Date(review.created_at).getTime();
  const now = Date.now();
  const maxAgeMs = 15 * 60 * 1000;
  if (now - created > maxAgeMs || created > now + 60_000) {
    return new Response(JSON.stringify({ ok: true, skipped: "stale_or_invalid_time" }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const avg = effectiveAverage({
    overall_average: review.overall_average,
    food_stars: review.food_stars,
    service_stars: review.service_stars,
    atmosphere_stars: review.atmosphere_stars,
    stars: review.stars,
  });

  if (avg > 3 + 1e-9) {
    return new Response(JSON.stringify({ ok: true, skipped: "above_threshold" }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: restaurantRow, error: restErr } = await admin
    .from("restaurants")
    .select("name, owner_id")
    .eq("id", review.restaurant_id)
    .maybeSingle();

  if (restErr || !restaurantRow?.owner_id) {
    console.error("Restaurant fetch failed", restErr);
    return new Response(JSON.stringify({ error: "Restaurant data missing" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("email")
    .eq("id", restaurantRow.owner_id)
    .maybeSingle();

  if (profileErr) {
    console.warn("profiles lookup (optional)", profileErr.message);
  }

  let to = profile?.email?.trim() ?? "";
  if (!to) {
    const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(
      restaurantRow.owner_id,
    );
    if (authErr) console.error("auth.admin.getUserById", authErr);
    to = authUser?.user?.email?.trim() ?? "";
  }

  if (!to) {
    console.error("No owner email for", restaurantRow.owner_id);
    return new Response(JSON.stringify({ error: "Owner email not found" }), {
      status: 422,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const envBase = (Deno.env.get("PUBLIC_APP_URL") ?? "").trim().replace(/\/$/, "");
  const dashboardBase = normalizeDashboardBase(body.dashboard_origin, envBase);
  const dashboardUrl = dashboardBase ? `${dashboardBase}/dashboard` : "";

  const food = review.food_stars ?? review.stars;
  const service = review.service_stars ?? review.stars;
  const atmosphere = review.atmosphere_stars ?? review.stars;
  const overallLabel = avg.toFixed(1);

  const feedbackPieces = [
    review.feedback_food?.trim(),
    review.feedback_service?.trim(),
    review.feedback_atmosphere?.trim(),
    review.feedback?.trim(),
  ].filter(Boolean) as string[];

  const feedbackPlain = feedbackPieces.length
    ? [...new Set(feedbackPieces)].join("\n\n")
    : "";
  const feedbackHtml = feedbackPlain
    ? escapeHtml(feedbackPlain).replace(/\n/g, "<br/>")
    : "<span style=\"color:#a8a29e;font-style:italic;\">No written feedback.</span>";

  const whenLabel = new Date(review.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = `⚠️ New Low Rating at ${restaurantRow.name}`;
  const senderEmail =
    Deno.env.get("BREVO_SENDER_EMAIL")?.trim() || DEFAULT_BREVO_SENDER_EMAIL;
  const senderName =
    Deno.env.get("BREVO_SENDER_NAME")?.trim() || DEFAULT_BREVO_SENDER_NAME;

  const htmlContent = buildHtml({
    restaurantName: restaurantRow.name,
    food,
    service,
    atmosphere,
    overall: overallLabel,
    feedbackHtml,
    whenLabel,
    dashboardUrl,
  });

  const res = await fetch(BREVO_SMTP_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": brevoKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Brevo error", res.status, detail, "recipient:", to);
    const hint =
      "Confirm the sender email is added and verified under Brevo → Senders. Ensure BREVO_API_KEY has transactional/API permission.";
    return new Response(
      JSON.stringify({
        error: "Brevo failed",
        detail: detail.slice(0, 2000),
        hint,
      }),
      {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }

  console.info("Low rating alert sent", {
    restaurant: restaurantRow.name,
    toDomain: to.includes("@") ? to.split("@")[1] : "",
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
