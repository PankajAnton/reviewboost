"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-transparent transition-all duration-200",
        scrolled && "border-zinc-800 bg-black/60 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo href="/" />

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#pricing"
            className="cursor-pointer text-sm font-medium text-zinc-400 transition-all duration-200 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="btn-orange-glow cursor-pointer rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
          >
            Dashboard
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="cursor-pointer rounded-xl p-2 text-zinc-300 transition-all duration-200 hover:bg-zinc-800 hover:text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-drawer"
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close menu overlay"
              className="absolute inset-0 cursor-pointer bg-black/70"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute left-0 right-0 top-16 z-50 border-b border-zinc-800 bg-zinc-950/95 shadow-xl backdrop-blur-lg"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <div className="flex flex-col gap-1 px-4 py-4">
                <Link
                  href="/#pricing"
                  className="cursor-pointer rounded-xl px-3 py-3 text-sm font-medium text-zinc-300 transition-all duration-200 hover:bg-zinc-900 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-orange-glow cursor-pointer rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
