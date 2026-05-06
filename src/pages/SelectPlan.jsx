import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LogoDark } from "../components/Logo.jsx";
import {
  FEATURES_FREE_TRIAL,
  FEATURES_STARTER,
  FEATURES_GROWTH,
} from "../lib/planFeatureLists.js";
import { PlanFeatureChecklist } from "../components/PlanFeatureChecklist.jsx";
import { getDashboardAccessDecision } from "../lib/subscriptionAccess.js";

const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

const shellFont = { fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' };

function isProfilesTableUnavailable(error) {
  if (!error || typeof error.message !== "string") return false;
  const code = error.code;
  const m = error.message.toLowerCase();
  if (code === "PGRST205" && m.includes("profiles")) return true;
  return (
    m.includes("profiles") &&
    (m.includes("schema cache") || m.includes("could not find the table"))
  );
}

export default function SelectPlan() {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !session?.user?.id) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan_type, subscription_status, subscription_end_date")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled || !data) return;

      const decision = getDashboardAccessDecision(data);
      if (decision.kind !== "ok") return;

      if (data.plan_type === "starter" || data.plan_type === "growth") {
        navigate("/dashboard", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, session, navigate]);

  async function startFreeTrial() {
    if (!user?.id) return;
    setError("");
    setBusy(true);
    const subscription_end_date = new Date(Date.now() + TRIAL_MS).toISOString();
    const { error: err } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? undefined,
        plan_type: "trial",
        restaurant_limit: 1,
        subscription_status: "trial",
        subscription_end_date,
      },
      { onConflict: "id" }
    );
    setBusy(false);
    if (err) {
      if (isProfilesTableUnavailable(err)) {
        setError(
          "Supabase could not find public.profiles — create it in your Supabase project. Open Dashboard → SQL Editor, paste and run supabase/schema.sql from this repo (full setup). If restaurants/reviews tables already exist, run supabase/quick_fix_profiles.sql instead. Wait ~1 minute for the schema cache to refresh, reload this page, then try Start Free Trial again."
        );
        return;
      }
      setError(
        err.message ||
          "Could not save your plan. Ensure the profiles table exists (run Supabase migrations)."
      );
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-stone-50"
        style={shellFont}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: "/select-plan" } }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50/80"
      style={shellFont}
    >
      <header className="border-b border-stone-200/90 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Home">
            <LogoDark size="nav" />
          </Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login", { replace: true });
            }}
            className="text-sm font-medium text-stone-600 hover:text-[#f97316]"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-stone-600 sm:text-lg">
            Start free, upgrade anytime.
            <br />
            No hidden charges.
          </p>
        </div>

        {error ? (
          <div
            className="mx-auto mt-8 max-w-3xl rounded-2xl bg-red-50 px-4 py-4 text-left text-sm leading-relaxed text-red-800 ring-1 ring-red-100 sm:px-5"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="mx-auto mt-14 grid max-w-7xl gap-8 lg:grid-cols-3 lg:items-stretch">
          {/* Free Trial */}
          <article className="flex flex-col rounded-3xl border-2 border-stone-300 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Free Trial</h2>
                <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight text-stone-900">
                  ₹0
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  30 days
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                No credit card needed
              </span>
            </div>
            <div className="mt-6 flex-1">
              <PlanFeatureChecklist items={FEATURES_FREE_TRIAL} />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={startFreeTrial}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-[#f97316] bg-white px-4 text-sm font-semibold text-[#f97316] shadow-sm transition hover:bg-orange-50 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Start Free Trial"}
            </button>
          </article>

          {/* Starter */}
          <article className="flex flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-lg lg:p-8">
            <h2 className="text-xl font-bold text-stone-900">Starter</h2>
            <p className="mt-4 text-4xl font-bold tabular-nums text-stone-900">
              ₹499
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-500">/month</p>
            <div className="mt-6 flex-1">
              <PlanFeatureChecklist items={FEATURES_STARTER} />
            </div>
            <Link
              to="/paywall"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
            >
              Choose Starter
            </Link>
          </article>

          {/* Growth */}
          <article className="relative flex flex-col rounded-3xl border-2 border-[#f97316] bg-white p-7 shadow-xl transition duration-200 hover:-translate-y-1 hover:shadow-2xl lg:p-8">
            <span className="absolute right-4 top-4 rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white shadow-md">
              Most Popular
            </span>
            <h2 className="pr-24 text-xl font-bold text-stone-900">Growth</h2>
            <p className="mt-4 text-4xl font-bold tabular-nums text-stone-900">
              ₹899
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-500">/month</p>
            <div className="mt-6 flex-1">
              <PlanFeatureChecklist items={FEATURES_GROWTH} />
            </div>
            <Link
              to="/paywall"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800"
            >
              Choose Growth
            </Link>
          </article>
        </div>
      </main>
    </div>
  );
}
