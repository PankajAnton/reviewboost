import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LogoDark } from "../components/Logo.jsx";
import { loadRazorpayScript } from "../lib/razorpayCheckout.js";

const SUBSCRIPTION_MS = 30 * 24 * 60 * 60 * 1000;

function subscriptionEndIso() {
  return new Date(Date.now() + SUBSCRIPTION_MS).toISOString();
}

export default function Paywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

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

    const options = {
      key: keyId,
      amount,
      currency: "INR",
      name: "ReviewBoost",
      description,
      handler: async () => {
        try {
          await applyPaidPlan(plan_type, restaurant_limit);
          navigate("/dashboard", { replace: true });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 to-stone-50">
      <header className="border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/dashboard"
            aria-label="Back to dashboard"
            className="flex shrink-0 items-center rounded-lg transition hover:opacity-90"
          >
            <LogoDark size="nav" />
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-stone-700 transition hover:text-[#f97316]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-center text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-stone-600">
          Unlock more locations with a monthly subscription. Payments open in a secure Razorpay window.
        </p>

        {error ? (
          <div
            className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700 ring-1 ring-red-100"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
            <h2 className="text-lg font-bold text-stone-900">Starter</h2>
            <p className="mt-1 text-sm font-medium text-stone-500">
              Perfect for single restaurants
            </p>
            <p className="mt-4 text-3xl font-bold tabular-nums text-stone-900">
              ₹499<span className="text-lg font-semibold text-stone-500">/mo</span>
            </p>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                Up to 3 restaurants
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                Smart review filtering
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                QR codes + PDF download
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                Email notifications
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                Dashboard access
              </li>
            </ul>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => openCheckout("starter")}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:opacity-60"
            >
              {busy === "starter" ? "Opening checkout…" : "Choose Starter - ₹499"}
            </button>
          </div>

          <div className="relative flex flex-col rounded-2xl bg-gradient-to-b from-amber-50/90 to-white p-6 shadow-lg ring-2 ring-[#f97316]/55">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white shadow-md">
              Most Popular
            </span>
            <h2 className="text-lg font-bold text-stone-900">Growth</h2>
            <p className="mt-1 text-sm font-medium text-stone-500">
              For restaurant chains
            </p>
            <p className="mt-4 text-3xl font-bold tabular-nums text-stone-900">
              ₹899<span className="text-lg font-semibold text-stone-500">/mo</span>
            </p>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                Up to 10 restaurants
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600" aria-hidden>
                  ✓
                </span>
                Everything in Starter
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#ea580c]" aria-hidden>
                  ★
                </span>
                Priority support
              </li>
            </ul>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => openCheckout("growth")}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:opacity-60"
            >
              {busy === "growth" ? "Opening checkout…" : "Choose Growth - ₹899"}
            </button>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-stone-500">
          For production, verify payments with Razorpay webhooks on your backend—client-only updates are not fraud-proof.
        </p>
      </main>
    </div>
  );
}
