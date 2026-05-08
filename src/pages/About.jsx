import { useEffect } from "react";
import { SiteMarketingNav } from "../components/SiteMarketingNav.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const values = [
  {
    emoji: "🇮🇳",
    title: "Made in India",
    body: "Built for Indian restaurants, priced for Indian budgets.",
  },
  {
    emoji: "⚡",
    title: "Simple by design",
    body: "No training needed. If you can print a menu, you can use ReviewBoost.",
  },
  {
    emoji: "🔒",
    title: "Your data, your rules",
    body: "We never sell your data or share feedback without your permission.",
  },
];

const stats = [
  { value: "500+", label: "Restaurants using ReviewBoost" },
  { value: "10,000+", label: "Reviews collected" },
  { value: "4.8★", label: "Average Google rating improvement" },
  { value: "< 2 min", label: "Setup time" },
];

export default function About() {
  useEffect(() => {
    document.title = "About — ReviewBoost";
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
      <SiteMarketingNav />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-24">
        <header className="text-center">
          <h1 className="text-[42px] font-extrabold leading-tight text-white">
            About ReviewBoost
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-zinc-400">
            Built for the people behind India&apos;s best restaurants
          </p>
        </header>

        <blockquote className="mx-auto mt-14 max-w-2xl text-center text-[28px] font-bold leading-relaxed text-white">
          &ldquo;We built ReviewBoost because great restaurants deserve great reputations — and one
          unfair review shouldn&apos;t undo months of hard work.&rdquo;
        </blockquote>

        <section className="mt-14 space-y-5 text-base leading-relaxed text-zinc-400">
          <p>
            ReviewBoost was built for busy restaurant owners who don&apos;t have time to chase reviews
            or manage complex software. We wanted something that just works — print a QR code, put it
            on the table, and let happy customers do the rest.
          </p>
          <p>
            Our smart filter means the good stuff goes to Google, and the feedback that needs
            attention stays with you, privately, so you can actually fix it.
          </p>
          <p>
            We&apos;re a small team based in India, building tools for the people who feed us.
          </p>
        </section>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {values.map(({ emoji, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7 shadow-[0_0_0_1px_#27272A] transition hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(249,115,22,0.12)]"
            >
              <span className="text-3xl" aria-hidden>
                {emoji}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center shadow-[0_0_0_1px_#27272A]"
            >
              <p className="text-2xl font-bold text-white md:text-3xl">{value}</p>
              <p className="mt-2 text-sm leading-snug text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
