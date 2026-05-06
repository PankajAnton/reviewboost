import { Link } from "react-router-dom";
import { LogoDark } from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  {
    title: "QR Code",
    desc: "Print one code on tables or receipts. Customers scan and rate in seconds—no apps, no friction.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={1.5} d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 15h6v4H4v-4zm12 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-2-2h2v-2h-2v2zm2 2v2h2v-2h-2z" />
      </svg>
    ),
  },
  {
    title: "Smart Filter",
    desc: "Warm experiences flow to Google. When something misses the mark, feedback stays with you—so you can fix it first.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18v4l-7 7v6l-4-2v-4L3 8V4z" />
      </svg>
    ),
  },
  {
    title: "Dashboard",
    desc: "See private notes, track promoter moments, and keep your Maps reputation climbing—with one calm, simple view.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 19V5m8 14V10m8 9v-5M4 19h16" />
      </svg>
    ),
  },
];

function PlanCheckLi({ children }) {
  return (
    <li className="flex gap-2 text-sm text-stone-600">
      <span className="shrink-0 text-emerald-600" aria-hidden>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function Landing() {
  const { session, loading: authLoading } = useAuth();

  const paidPlanHref = session ? "/paywall" : "/signup";

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
          <Link
            to="/pricing"
            className="inline-flex min-h-0 flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-medium leading-snug text-stone-700 transition hover:bg-white/80 hover:shadow-md sm:flex-none sm:px-4 sm:py-2.5"
          >
            Pricing
          </Link>
          {authLoading ? null : session ? (
            <Link
              to="/dashboard"
              className="inline-flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#f97316] px-3 py-2.5 text-center text-sm font-semibold leading-snug text-white shadow-sm transition hover:bg-[#ea580c] hover:shadow-md sm:flex-none sm:px-4 sm:py-2.5"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-0 flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-medium leading-snug text-stone-700 transition hover:bg-white/80 hover:shadow-md sm:flex-none sm:px-4 sm:py-2.5"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#f97316] px-3 py-2.5 text-center text-sm font-semibold leading-snug text-white shadow-sm transition hover:bg-[#ea580c] hover:shadow-md sm:flex-none sm:px-4 sm:py-2.5"
              >
                <span className="sm:hidden">Start free</span>
                <span className="hidden sm:inline">Get Started Free</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <LogoDark size="hero" className="justify-center" />
            </div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-amber-800 shadow-md ring-1 ring-amber-100">
              Built for busy restaurant teams
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
              Turn Happy Customers Into{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-amber-500 bg-clip-text text-transparent">
                5-Star Reviews
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-600 sm:text-xl">
              Smart review filtering for restaurants. Good reviews go to Google. Bad ones stay with you.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/signup"
                className="inline-flex min-h-0 w-full max-w-sm items-center justify-center whitespace-nowrap rounded-xl bg-[#f97316] px-7 py-2.5 text-sm font-semibold leading-normal text-white shadow-sm transition hover:bg-[#ea580c] hover:shadow-md sm:w-auto sm:max-w-none sm:px-8 sm:text-base"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-0 w-full max-w-sm items-center justify-center rounded-xl bg-white px-6 py-2.5 text-center text-xs font-semibold leading-snug text-stone-800 shadow-sm ring-1 ring-stone-200/80 transition hover:ring-[#f97316]/30 sm:px-8 sm:text-sm sm:leading-normal md:text-base"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="group rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-stone-200/60 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#f97316] shadow-sm ring-1 ring-amber-100 transition group-hover:bg-[#f97316] group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-amber-100/80 bg-white/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Choose your plan
              </h2>
              <p className="mt-3 text-stone-600">
                Unlock more locations with a monthly subscription. Paid plans checkout securely with Razorpay after you create an account.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
              {/* Free trial */}
              <div className="flex flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
                <h3 className="text-lg font-bold text-stone-900">Free trial</h3>
                <p className="mt-1 text-sm font-medium text-stone-500">
                  Try everything before you commit
                </p>
                <p className="mt-4 text-3xl font-bold tabular-nums text-stone-900">
                  ₹0
                </p>
                <p className="mt-1 text-sm font-medium text-stone-500">30 days · 1 restaurant</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  <PlanCheckLi>All product features unlocked during trial</PlanCheckLi>
                  <PlanCheckLi>Smart review filtering</PlanCheckLi>
                  <PlanCheckLi>QR codes + PDF download</PlanCheckLi>
                  <PlanCheckLi>Email notifications</PlanCheckLi>
                  <PlanCheckLi>Dashboard access</PlanCheckLi>
                </ul>
                <Link
                  to="/signup"
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Starter */}
              <div className="flex flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
                <h3 className="text-lg font-bold text-stone-900">Starter</h3>
                <p className="mt-1 text-sm font-medium text-stone-500">
                  Perfect for single restaurants
                </p>
                <p className="mt-4 text-3xl font-bold tabular-nums text-stone-900">
                  ₹499<span className="text-lg font-semibold text-stone-500">/mo</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  <PlanCheckLi>Up to 3 restaurants</PlanCheckLi>
                  <PlanCheckLi>Smart review filtering</PlanCheckLi>
                  <PlanCheckLi>QR codes + PDF download</PlanCheckLi>
                  <PlanCheckLi>Email notifications</PlanCheckLi>
                  <PlanCheckLi>Dashboard access</PlanCheckLi>
                </ul>
                <Link
                  to={paidPlanHref}
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
                >
                  Choose Starter – ₹499
                </Link>
              </div>

              {/* Growth */}
              <div className="relative flex flex-col rounded-2xl bg-gradient-to-b from-amber-50/90 to-white p-6 shadow-lg ring-2 ring-[#f97316]/55">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Most Popular
                </span>
                <h3 className="text-lg font-bold text-stone-900">Growth</h3>
                <p className="mt-1 text-sm font-medium text-stone-500">
                  For restaurant chains
                </p>
                <p className="mt-4 text-3xl font-bold tabular-nums text-stone-900">
                  ₹899<span className="text-lg font-semibold text-stone-500">/mo</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  <PlanCheckLi>Up to 10 restaurants</PlanCheckLi>
                  <PlanCheckLi>Everything in Starter</PlanCheckLi>
                  <li className="flex gap-2 text-sm text-stone-600">
                    <span className="shrink-0 font-semibold text-[#ea580c]" aria-hidden>
                      ★
                    </span>
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link
                  to={paidPlanHref}
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
                >
                  Choose Growth – ₹899
                </Link>
              </div>
            </div>

            <p className="mx-auto mt-10 max-w-xl text-center text-xs text-stone-500">
              Already exploring?{" "}
              <Link to="/pricing" className="font-semibold text-[#ea580c] hover:underline">
                Full pricing page
              </Link>
            </p>
          </div>
        </section>

        <footer className="border-t border-stone-200/80 bg-stone-50 py-10 text-center text-sm text-stone-500">
          <p>© {new Date().getFullYear()} ReviewBoost · Crafted for restaurateurs</p>
        </footer>
      </main>
    </div>
  );
}
