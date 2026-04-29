import { Link } from "react-router-dom";

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

const tiers = [
  { name: "Free", price: "₹0", blurb: "1 location · basic QR", highlight: false },
  { name: "Starter", price: "₹499/mo", blurb: "Up to 3 locations · email support", highlight: true },
  { name: "Pro", price: "₹999/mo", blurb: "Unlimited · priority support", highlight: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-stone-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-stone-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f97316] text-sm font-bold text-white shadow-md">
            RB
          </span>
          ReviewBoost
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="min-h-12 rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-white/80 hover:shadow-md"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="min-h-12 rounded-2xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c] hover:shadow-lg"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
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
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#f97316] px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#ea580c] hover:shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-8 py-3.5 text-base font-semibold text-stone-800 shadow-md ring-1 ring-stone-200/80 transition hover:ring-[#f97316]/30"
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
                Simple pricing
              </h2>
              <p className="mt-3 text-stone-600">
                Grow at your pace. Upgrade when you open your next location.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className={`relative flex flex-col rounded-2xl p-6 shadow-md ring-1 transition hover:shadow-lg ${
                    t.highlight
                      ? "bg-gradient-to-b from-amber-50 to-white ring-[#f97316]/40"
                      : "bg-white ring-stone-200/70"
                  }`}
                >
                  {t.highlight ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white shadow-md">
                      Popular
                    </span>
                  ) : null}
                  <h3 className="text-lg font-semibold text-stone-900">{t.name}</h3>
                  <p className="mt-3 text-3xl font-bold text-stone-900">{t.price}</p>
                  <p className="mt-2 text-sm text-stone-600">{t.blurb}</p>
                  <Link
                    to="/signup"
                    className={`mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      t.highlight
                        ? "bg-[#f97316] text-white shadow-md hover:bg-[#ea580c]"
                        : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                    }`}
                  >
                    Choose {t.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-stone-200/80 bg-stone-50 py-10 text-center text-sm text-stone-500">
          <p>© {new Date().getFullYear()} ReviewBoost · Crafted for restaurateurs</p>
        </footer>
      </main>
    </div>
  );
}
