import { useEffect } from "react";
import { SiteMarketingNav } from "./SiteMarketingNav.jsx";
import SiteFooter from "./SiteFooter.jsx";

export const MARKETING_LAST_UPDATED = "January 2025";

export default function SiteLegalLayout({ title, subtitle, documentTitle, children }) {
  useEffect(() => {
    document.title =
      documentTitle ?? `${title} — ReviewBoost`;
  }, [documentTitle, title]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 antialiased">
      <SiteMarketingNav />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-24">
        <header className="border-b border-zinc-800 pb-12">
          <span className="mb-8 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-500">
            Last updated: {MARKETING_LAST_UPDATED}
          </span>
          <h1 className="mb-3 text-[42px] font-extrabold leading-tight tracking-tight text-white">
            {title}
          </h1>
          <p className="text-[17px] leading-relaxed text-zinc-400">{subtitle}</p>
        </header>

        <div className="mt-12 space-y-0 [&_a]:text-orange-400 [&_a]:underline-offset-2 [&_a:hover]:underline">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
