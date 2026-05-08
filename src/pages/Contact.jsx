import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Mail, Shield } from "lucide-react";
import { SiteMarketingNav } from "../components/SiteMarketingNav.jsx";
import SiteFooter from "../components/SiteFooter.jsx";

const subjects = ["General", "Billing", "Bug Report", "Other"];

const cards = [
  {
    Icon: Mail,
    title: "General Support",
    body: "Questions about your account, QR codes, or dashboard",
    email: "support@reviewboost.in",
    badge: "Replies within 1 business day",
  },
  {
    Icon: CreditCard,
    title: "Billing & Refunds",
    body: "Questions about payments, invoices, or refund requests",
    email: "billing@reviewboost.in",
  },
  {
    Icon: Shield,
    title: "Legal & Privacy",
    body: "Data requests, privacy concerns, or legal matters",
    email: "legal@reviewboost.in",
  },
];

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-zinc-500 transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Us — ReviewBoost";
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email.";
    if (!message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
      <SiteMarketingNav />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <header>
          <h1 className="text-[42px] font-extrabold leading-tight text-white md:text-[48px]">
            Contact Us
          </h1>
          <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-zinc-400">
            We&apos;re a small team — we read every message
          </p>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            {cards.map(({ Icon, title, body, email, badge }) => (
              <article
                key={email}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-[0_0_0_1px_#27272A]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                    <Icon className="h-6 w-6 text-orange-400" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{body}</p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-3 inline-block text-sm font-medium text-orange-400 hover:underline"
                    >
                      {email}
                    </a>
                    {badge ? (
                      <p className="mt-3 text-xs font-semibold text-green-400">{badge}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-[0_0_0_1px_#27272A] lg:sticky lg:top-28 lg:self-start">
            {success ? (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <div className="text-6xl" aria-hidden>
                  ✓
                </div>
                <p className="mt-6 text-xl font-semibold text-white">Message sent!</p>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-zinc-400">
                  We&apos;ll reply within 1 business day.
                </p>
                <Link
                  to="/"
                  className="mt-8 text-sm font-medium text-orange-400 hover:underline"
                >
                  ← Back home
                </Link>
              </div>
            ) : (
              <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-sm text-zinc-400">
                    Name
                  </label>
                  <input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} ${errors.name ? "border-red-500/80" : ""}`}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="c-email" className="mb-1.5 block text-sm text-zinc-400">
                    Email
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} ${errors.email ? "border-red-500/80" : ""}`}
                    placeholder="you@restaurant.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="c-subj" className="mb-1.5 block text-sm text-zinc-400">
                    Subject
                  </label>
                  <select
                    id="c-subj"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-msg" className="mb-1.5 block text-sm text-zinc-400">
                    Message
                  </label>
                  <textarea
                    id="c-msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className={`${inputClass} min-h-[120px] resize-y ${
                      errors.message ? "border-red-500/80" : ""
                    }`}
                    placeholder="Tell us how we can help..."
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-400">{errors.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full cursor-pointer rounded-xl bg-orange-500 py-4 text-base font-semibold text-white shadow-[0_0_32px_rgba(249,115,22,0.12)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-85"
                >
                  {loading ? (
                    <span
                      className="mx-auto inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden
                    />
                  ) : (
                    "Send message"
                  )}
                </button>
                <p className="mt-2 text-center text-xs text-zinc-500">
                  For urgent issues, include your registered email in the message so we can look up
                  your account faster.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
