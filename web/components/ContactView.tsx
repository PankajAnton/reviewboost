"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, Mail, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { staggerContainer, fadeInUpChild } from "@/lib/motion";

type ContactCardDef = {
  Icon: LucideIcon;
  title: string;
  body: string;
  email: string;
  badge?: string;
};

const contactCards: ContactCardDef[] = [
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

const viewportOnce = { once: true as const, margin: "-80px" as const };

export function ContactView() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24">
          <motion.header
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h1 className="font-display text-[42px] font-extrabold leading-tight text-white md:text-[48px]">
              Contact Us
            </h1>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-zinc-400">
              We&apos;re a small team — we read every message
            </p>
          </motion.header>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <motion.div
              className="flex flex-col gap-5"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {contactCards.map(({ Icon, title, body, email, badge }) => (
                <motion.article
                  key={email}
                  variants={fadeInUpChild}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-[0_0_0_1px_#27272A]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                      <Icon className="h-6 w-6 text-orange-400" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-lg font-bold text-white">
                        {title}
                      </h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
                        {body}
                      </p>
                      <Link
                        href={`mailto:${email}`}
                        className="mt-3 inline-block cursor-pointer text-sm font-medium text-orange-400 underline-offset-2 transition-colors duration-200 hover:underline"
                      >
                        {email}
                      </Link>
                      {badge ? (
                        <p className="mt-3 text-xs font-semibold text-green-400">
                          {badge}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.06 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
