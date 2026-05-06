import { useCallback, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LogoDark } from "../components/Logo.jsx";
import { loadRazorpayScript } from "../lib/razorpayCheckout.js";
import { FEATURES_STARTER, FEATURES_GROWTH } from "../lib/planFeatureLists.js";
import { PlanFeatureChecklist } from "../components/PlanFeatureChecklist.jsx";

const SUBSCRIPTION_MS = 30 * 24 * 60 * 60 * 1000;

const EDGE_FN_SETUP_HINT =
  "Supabase could not reach the payment backend. Deploy create-razorpay-order and set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET on Edge secrets.";

const EDGE_FN_NON_2XX_FALLBACK =
  "Payment backend error — check Edge Function logs and Supabase secrets for Razorpay.";

function subscriptionEndIso() {
  return new Date(Date.now() + SUBSCRIPTION_MS).toISOString();
}

async function resolveInvokeFailureMessage(orderFnErr, orderData) {
  if (
    orderData &&
    typeof orderData === "object" &&
    orderData !== null &&
    typeof /** @type {{ error?: unknown }} */ (orderData).error === "string"
  ) {
    return /** @type {{ error: string }} */ (orderData).error;
  }

  const httpCtx =
    orderFnErr instanceof FunctionsHttpError ? orderFnErr.context : null;
  const fallbackResp =
    !httpCtx &&
    orderFnErr &&
    typeof orderFnErr === "object" &&
    orderFnErr !== null &&
    "context" in orderFnErr &&
    /** @type {{ context?: unknown }} */ (orderFnErr).context instanceof Response
      ? /** @type {{ context: Response }} */ (orderFnErr).context
      : null;

  const ctx = httpCtx instanceof Response ? httpCtx : fallbackResp;

  if (ctx instanceof Response) {
    if (ctx.status === 401) {
      return "Session rejected (401). Log out and sign in again.";
    }
    try {
      const ct = (ctx.headers.get("Content-Type") || "").toLowerCase();
      if (ct.includes("application/json")) {
        const body = await ctx.clone().json();
        if (body && typeof body === "object") {
          if (typeof body.error === "string") return body.error;
          if (typeof body.message === "string") return body.message;
        }
      }
    } catch {
      /* ignore */
    }
  }

  const clientMsg =
    orderFnErr && typeof orderFnErr.message === "string" ? orderFnErr.message : "";

  if (/failed to send a request to the edge function/i.test(clientMsg)) {
    return EDGE_FN_SETUP_HINT;
  }

  if (/non-2xx/i.test(clientMsg)) {
    return EDGE_FN_NON_2XX_FALLBACK;
  }

  return clientMsg || EDGE_FN_NON_2XX_FALLBACK;
}

function LockIcon() {
  return (
    <div
      className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 shadow-inner ring-4 ring-orange-200/90"
      aria-hidden
    >
      <svg
        className="h-12 w-12 text-[#f97316]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </div>
  );
}

const shellFont = { fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' };

export default function Paywall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const reason =
    location.state?.reason === "trial_expired"
      ? "trial_expired"
      : location.state?.reason === "subscription_expired"
        ? "subscription_expired"
        : null;

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim();

  const applyPaidPlan = useCallback(
    async (plan_type, restaurant_limit) => {
      if (!user?.id) return;
      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          plan_type,
          restaurant_limit,
          subscription_status: "active",
          subscription_end_date: subscriptionEndIso(),
        })
        .eq("id", user.id);
      if (upErr) throw upErr;
    },
    [user?.id]
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  async function openCheckout(kind) {
    setError("");
    if (!user?.id) {
      setError("Please sign in again.");
      return;
    }
    if (!keyId) {
      setError(
        "Payments are not configured. Add VITE_RAZORPAY_KEY_ID to your environment and rebuild."
      );
      return;
    }

    const sbUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
    if (
      !sbUrl ||
      sbUrl.includes("YOUR_PROJECT_ID") ||
      sbUrl.includes("YOUR_PROJECT")
    ) {
      setError(
        "Set VITE_SUPABASE_URL in .env to your Supabase Project URL, restart the dev server, and try again."
      );
      return;
    }

    const starter = kind === "starter";
    const amount = starter ? 49900 : 89900;
    const description = starter
      ? "Starter Plan - 3 Restaurants"
      : "Growth Plan - 10 Restaurants";
    const plan_type = starter ? "starter" : "growth";
    const restaurant_limit = starter ? 3 : 10;

    setBusy(kind);
    try {
      await loadRazorpayScript();
    } catch {
      setError("Could not load payment checkout. Check your network and try again.");
      setBusy(null);
      return;
    }

    const { data: orderData, error: orderFnErr } = await supabase.functions.invoke(
      "create-razorpay-order",
      { body: { amount } }
    );
    if (orderFnErr || !orderData?.order_id) {
      setError(await resolveInvokeFailureMessage(orderFnErr, orderData));
      setBusy(null);
      return;
    }

    const options = {
      key: keyId,
      order_id: orderData.order_id,
      name: "ReviewBoost",
      description,
      handler: async () => {
        try {
          await applyPaidPlan(plan_type, restaurant_limit);
          navigate("/dashboard", {
            replace: true,
            state: { toast: "Access restored! Welcome back 🎉" },
          });
        } catch (e) {
          setError(e?.message || "Could not activate your plan. Contact support.");
        } finally {
          setBusy(null);
        }
      },
      modal: {
        ondismiss: () => setBusy(null),
      },
      theme: { color: "#f97316" },
    };

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setError("Payment SDK missing after load.");
      setBusy(null);
      return;
    }

    const rz = new Razorpay(options);
    rz.on("payment.failed", () => {
      setError("Payment failed or was cancelled. You were not charged.");
      setBusy(null);
    });
    rz.open();
  }

  const heading =
    reason === "trial_expired"
      ? "Your free trial has ended"
      : reason === "subscription_expired"
        ? "Your subscription has expired"
        : "Renew your access";

  const subtext =
    reason === "trial_expired"
      ? "Upgrade to keep growing your Google ratings"
      : reason === "subscription_expired"
        ? "Renew now to regain full access to your dashboard"
        : "Choose a plan to continue using ReviewBoost";

  return (
    <div
      className="flex min-h-screen flex-col bg-gradient-to-b from-stone-100 via-stone-50 to-white"
      style={shellFont}
    >
      <header className="border-b border-stone-200/90 bg-white/95 py-4 text-center shadow-sm">
        <Link to="/" className="inline-block" aria-label="ReviewBoost home">
          <LogoDark size="nav" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-5xl flex-1">
          <LockIcon />

          <h1 className="mt-8 text-center text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {heading}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-center text-base leading-relaxed text-stone-600">
            {subtext}
          </p>

          {error ? (
            <div
              className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 px-4 py-4 text-left text-sm leading-relaxed text-red-800 ring-1 ring-red-100"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2 md:items-stretch">
            <article className="flex flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl md:p-8">
              <h2 className="text-xl font-bold text-stone-900">Starter</h2>
              <p className="mt-3 text-3xl font-bold text-stone-900">
                ₹499<span className="text-lg font-semibold text-stone-500">/month</span>
              </p>
              <div className="mt-6 flex-1">
                <PlanFeatureChecklist items={FEATURES_STARTER} />
              </div>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => openCheckout("starter")}
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:opacity-60"
              >
                {busy === "starter" ? "Opening checkout…" : "Renew Starter - ₹499"}
              </button>
            </article>

            <article className="relative flex flex-col rounded-3xl border-2 border-[#f97316] bg-white p-7 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl md:p-8">
              <span className="absolute right-4 top-4 rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white shadow-md">
                Most Popular
              </span>
              <h2 className="pr-28 text-xl font-bold text-stone-900">Growth</h2>
              <p className="mt-3 text-3xl font-bold text-stone-900">
                ₹899<span className="text-lg font-semibold text-stone-500">/month</span>
              </p>
              <div className="mt-6 flex-1">
                <PlanFeatureChecklist items={FEATURES_GROWTH} />
              </div>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => openCheckout("growth")}
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800 disabled:opacity-60"
              >
                {busy === "growth" ? "Opening checkout…" : "Renew Growth - ₹899"}
              </button>
            </article>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-stone-500">
            Payments run in Razorpay Checkout. For production, verify charges with webhooks on your backend.
          </p>
        </div>

        <footer className="mx-auto mt-auto w-full max-w-5xl pt-16 text-center">
          <p className="text-sm text-stone-600">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@reviewboost.in"
              className="font-semibold text-[#ea580c] hover:underline"
            >
              support@reviewboost.in
            </a>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 text-sm font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
          >
            Log out
          </button>
        </footer>
      </main>
    </div>
  );
}
