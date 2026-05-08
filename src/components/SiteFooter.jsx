import { Link } from "react-router-dom";
import { LogoLight } from "./Logo.jsx";

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-of-service", label: "Terms of Service" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/cookie-policy", label: "Cookie Policy" },
];

/**
 * Marketing / legal footer — dark strip. Use at bottom of landing & static pages.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12 text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link
              to="/"
              aria-label="ReviewBoost home"
              className="inline-flex items-center rounded-lg outline-none ring-offset-2 ring-offset-zinc-950 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <LogoLight size="nav" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Turn Happy Customers Into 5-Star Reviews
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-500">
            <Link
              to="/#features"
              className="cursor-pointer transition-colors duration-200 hover:text-white"
            >
              Product
            </Link>
            <Link
              to="/#pricing"
              className="cursor-pointer transition-colors duration-200 hover:text-white"
            >
              Pricing
            </Link>
            <Link to="/about" className="cursor-pointer transition-colors duration-200 hover:text-white">
              About
            </Link>
            <Link to="/contact" className="cursor-pointer transition-colors duration-200 hover:text-white">
              Contact
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-zinc-800 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-600">
            © 2024 ReviewBoost · Crafted for restaurateurs
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500 md:justify-end">
            {legalLinks.flatMap((item, i) => [
              ...(i > 0
                ? [<span key={`sep-${item.to}`} className="text-zinc-700" aria-hidden>·</span>]
                : []),
              <Link
                key={item.to}
                to={item.to}
                className="cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </Link>,
            ])}
          </div>
        </div>
      </div>
    </footer>
  );
}
