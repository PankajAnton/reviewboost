import { Link } from "react-router-dom";
import { LogoLight } from "./Logo.jsx";

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-of-service", label: "Terms of Service" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/cookie-policy", label: "Cookie Policy" },
];

const mainNavLinks = [
  { to: "/#features", label: "Product" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

/**
 * Marketing / legal footer — dark strip. Use at bottom of landing & static pages.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12 text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xs md:mx-0">
            <div className="flex justify-center md:justify-start">
              <Link
                to="/"
                aria-label="ReviewBoost home"
                className="inline-flex items-center rounded-lg outline-none ring-offset-2 ring-offset-zinc-950 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <LogoLight size="nav" />
              </Link>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Turn Happy Customers Into 5-Star Reviews
            </p>
          </div>

          <nav
            aria-label="Main"
            className="flex w-full max-w-sm flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500 sm:max-w-none sm:gap-x-8 md:w-auto md:justify-end"
          >
            {mainNavLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="cursor-pointer whitespace-nowrap py-1 transition-colors duration-200 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6 border-t border-zinc-800 pt-6 text-center md:flex-row md:items-center md:justify-between md:gap-8 md:text-left">
          <p className="text-pretty text-sm text-zinc-600 max-md:max-w-[min(100%,20rem)]">
            © 2026 ReviewBoost · Crafted for restaurateurs
          </p>

          <nav
            aria-label="Legal"
            className="flex w-full flex-col items-center gap-3 text-sm text-zinc-500 md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-y-2"
          >
            {legalLinks.map((item, i) => (
              <span
                key={item.to}
                className="inline-flex items-center whitespace-nowrap"
              >
                {i > 0 ? (
                  <span className="hidden pr-2 text-zinc-700 md:inline" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  to={item.to}
                  className="cursor-pointer py-1 underline-offset-2 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
