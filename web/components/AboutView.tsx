"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { staggerContainer, fadeInUpChild } from "@/lib/motion";

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
] as const;

const stats = [
  { value: "500+", label: "Restaurants using ReviewBoost" },
  { value: "10,000+", label: "Reviews collected" },
  { value: "4.8★", label: "Average Google rating improvement" },
  { value: "< 2 min", label: "Setup time" },
] as const;

const viewportOnce = { once: true as const, margin: "-100px" as const };

export function AboutView() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-24">
          <motion.header
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-display text-[42px] font-extrabold leading-tight text-white">
              About ReviewBoost
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-zinc-400">
              Built for the people behind India&apos;s best restaurants
            </p>
          </motion.header>

          <motion.blockquote
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto mt-14 max-w-2xl text-center font-display text-[28px] font-bold leading-relaxed text-white"
          >
            &ldquo;We built ReviewBoost because great restaurants deserve great
            reputations — and one unfair review shouldn&apos;t undo months of hard
            work.&rdquo;
          </motion.blockquote>

          <motion.section
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.06 }}
            className="mt-14 space-y-5 text-base leading-relaxed text-zinc-400"
          >
            <p>
              ReviewBoost was built for busy restaurant owners who don&apos;t have
              time to chase reviews or manage complex software. We wanted
              something that just works — print a QR code, put it on the table,
              and let happy customers do the rest.
            </p>
            <p>
              Our smart filter means the good stuff goes to Google, and the
              feedback that needs attention stays with you, privately, so you can
              actually fix it.
            </p>
            <p>
              We&apos;re a small team based in India, building tools for the people
              who feed us.
            </p>
          </motion.section>

          <motion.div
            className="mt-14 grid gap-6 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {values.map(({ emoji, title, body }) => (
              <motion.article
                key={title}
                variants={fadeInUpChild}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-7 shadow-[0_0_0_1px_#27272A] transition-all duration-200 hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(249,115,22,0.12)]"
              >
                <span className="text-3xl" aria-hidden>
                  {emoji}
                </span>
                <h2 className="mt-4 font-display text-xl font-semibold text-white">
                  {title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
                  {body}
                </p>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {stats.map(({ label, value }) => (
              <motion.div
                key={label}
                variants={fadeInUpChild}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center shadow-[0_0_0_1px_#27272A]"
              >
                <p className="font-display text-2xl font-bold text-white md:text-3xl">
                  {value}
                </p>
                <p className="mt-2 text-sm leading-snug text-zinc-400">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
