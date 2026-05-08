import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-zinc-950">
        <section
          id="features"
          className="scroll-mt-24 px-6 pb-16 pt-28 text-center md:pt-32"
        >
          <h1 className="font-display text-4xl font-extrabold text-white md:text-5xl">
            ReviewBoost
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Smart review filtering for restaurants — good reviews go to Google;
            feedback that needs work stays with you privately.
          </p>
        </section>
        <section
          id="pricing"
          className="scroll-mt-24 border-t border-zinc-800 px-6 py-24 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Pricing
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">
            Plans on the main marketing site
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Detailed pricing lives here when you wire the full landing — this
            anchor keeps footer links working.
          </p>
          <Link
            href="/dashboard"
            className="mt-10 inline-flex cursor-pointer rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-orange-600"
          >
            Get started
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
