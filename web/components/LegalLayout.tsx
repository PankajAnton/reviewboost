"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { staggerContainer, fadeInUpChild } from "@/lib/motion";

export const LEGAL_LAST_UPDATED = "January 2025";

const headerFade = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const contentViewport = { once: true as const, margin: "-80px" as const };

export function LegalLayout({
  title,
  subtitle,
  children,
  lastUpdated = LEGAL_LAST_UPDATED,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  lastUpdated?: string;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-24">
          <motion.header
            initial="hidden"
            whileInView="visible"
            viewport={contentViewport}
            variants={headerFade}
          >
            <span className="mb-8 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-500">
              Last updated: {lastUpdated}
            </span>
            <h1 className="mb-3 font-display text-[42px] font-extrabold leading-tight text-white">
              {title}
            </h1>
            <p className="mb-12 text-[17px] leading-relaxed text-zinc-400">{subtitle}</p>
            <div className="mb-12 border-b border-zinc-800" />
          </motion.header>

          <motion.div
            className="[&_a]:text-orange-400 [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:underline"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={contentViewport}
          >
            {children}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section variants={fadeInUpChild} className="scroll-mt-24 pt-10 first:pt-0">
      <h2 className="mb-4 font-display text-xl font-bold leading-snug text-white">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-zinc-400">{children}</div>
    </motion.section>
  );
}

export function LegalHighlight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.08] p-5 text-sm leading-relaxed text-orange-200">
      {children}
    </div>
  );
}

export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-orange-400 underline-offset-2 transition-colors duration-200 hover:underline"
    >
      {children}
    </Link>
  );
}
