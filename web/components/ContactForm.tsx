"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleCheckBig } from "lucide-react";
import { cn } from "@/lib/cn";

const subjects = ["General", "Billing", "Bug Report", "Other"] as const;

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-zinc-500 transition-all duration-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<(typeof subjects)[number]>("General");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email.";
    if (!message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-[0_0_0_1px_#27272A]">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center px-4 py-10 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.08,
                type: "spring",
                stiffness: 260,
                damping: 16,
              }}
            >
              <CircleCheckBig className="h-[72px] w-[72px] text-green-500" strokeWidth={1.75} />
            </motion.div>
            <p className="mt-6 font-display text-xl font-semibold text-white">
              Message sent!
            </p>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-zinc-400">
              We&apos;ll reply within 1 business day.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="contact-name" className="mb-1.5 block text-sm text-zinc-400">
                Name
              </label>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((er) => {
                    const n = { ...er };
                    delete n.name;
                    return n;
                  });
                }}
                className={cn(inputClass, errors.name && "border-red-500/80")}
                placeholder="Your name"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="mb-1.5 block text-sm text-zinc-400">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((er) => {
                    const n = { ...er };
                    delete n.email;
                    return n;
                  });
                }}
                className={cn(inputClass, errors.email && "border-red-500/80")}
                placeholder="you@restaurant.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-subject" className="mb-1.5 block text-sm text-zinc-400">
                Subject
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value as (typeof subjects)[number])
                }
                className={cn(inputClass, "cursor-pointer appearance-none")}
              >
                {subjects.map((s) => (
                  <option key={s} value={s} className="bg-zinc-900">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-1.5 block text-sm text-zinc-400">
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setErrors((er) => {
                    const n = { ...er };
                    delete n.message;
                    return n;
                  });
                }}
                rows={5}
                className={cn(
                  inputClass,
                  "min-h-[120px] resize-y",
                  errors.message && "border-red-500/80",
                )}
                placeholder="Tell us how we can help..."
              />
              {errors.message && (
                <p className="mt-1.5 text-sm text-red-400">{errors.message}</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? undefined : { scale: 1.02 }}
              whileTap={loading ? undefined : { scale: 0.98 }}
              className="btn-orange-glow mt-1 flex w-full cursor-pointer items-center justify-center rounded-xl bg-orange-500 py-4 text-base font-semibold text-white shadow-[0_0_32px_rgba(249,115,22,0.12)] transition-all duration-200 hover:bg-orange-600 disabled:opacity-85"
            >
              {loading ? (
                <span
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
              ) : (
                "Send message"
              )}
            </motion.button>

            <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">
              For urgent issues, include your registered email in the message so
              we can look up your account faster.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
