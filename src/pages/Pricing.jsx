import { Link } from "react-router-dom";
import { LogoDark } from "../components/Logo.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Pricing() {
  const { session, loading } = useAuth();

  function paidHref() {
    return session ? "/paywall" : "/signup";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-stone-50 to-white">
      <header className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6">
        <Link
          to="/"
          aria-label="ReviewBoost home"
          className="inline-flex shrink-0 items-center rounded-lg transition hover:opacity-90"
        >
          <LogoDark size="nav" />
        </Link>
        <nav className="flex w-full gap-2 sm:w-auto sm:shrink-0 sm:justify-end sm:gap-3">
          {loading ? null : session ? (
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c] sm:flex-none"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-medium text-stone-700 transition hover:bg-white/80 sm:flex-none"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c] sm:flex-none"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Start free for 30 days, then scale as you add locations.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          <article className="flex flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/70">
            <h2 className="text-lg font-bold text-stone-900">Free trial</h2>
            <p className="mt-3 text-3xl font-bold tabular-nums text-stone-900">₹0</p>
            <p className="mt-1 text-sm font-medium text-stone-500">30 days</p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>1 restaurant
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                All features unlocked during trial
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              Start Free Trial
            </Link>
          </article>

          <article className="flex flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/70">
            <h2 className="text-lg font-bold text-stone-900">Starter</h2>
            <p className="mt-3 text-3xl font-bold tabular-nums text-stone-900">
              ₹499<span className="text-base font-semibold text-stone-500">/mo</span>
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>3 restaurants
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                All core features
              </li>
            </ul>
            <Link
              to={paidHref()}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
            >
              Get Started
            </Link>
          </article>

          <article className="relative flex flex-col rounded-2xl bg-gradient-to-b from-amber-50/90 to-white p-6 shadow-lg ring-2 ring-[#f97316]/50">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white shadow-md">
              Recommended
            </span>
            <h2 className="text-lg font-bold text-stone-900">Growth</h2>
            <p className="mt-3 text-3xl font-bold tabular-nums text-stone-900">
              ₹899<span className="text-base font-semibold text-stone-500">/mo</span>
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-stone-600">
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>10 restaurants
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                All features
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#ea580c]">★</span>
                Priority support
              </li>
            </ul>
            <Link
              to={paidHref()}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
            >
              Get Started
            </Link>
          </article>
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-stone-500">
          Paid plans are billed via Razorpay after you create an account. Trial includes one venue for 30 days with full product access.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
