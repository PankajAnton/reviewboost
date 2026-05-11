import Link from "next/link";
import { Logo } from "@/components/Logo";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
] as const;

const mainNavLinks = [
  { href: "/#features", label: "Product" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xs md:mx-0">
            <div className="flex justify-center md:justify-start">
              <Logo href="/" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Turn Happy Customers Into 5-Star Reviews
            </p>
          </div>

          <nav
            aria-label="Main"
            className="flex w-full max-w-sm flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500 sm:max-w-none sm:gap-x-8 md:w-auto md:justify-end"
          >
            {mainNavLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="cursor-pointer whitespace-nowrap py-1 transition-all duration-200 hover:text-white"
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
                key={item.href}
                className="inline-flex items-center whitespace-nowrap"
              >
                {i > 0 ? (
                  <span className="hidden pr-2 text-zinc-700 md:inline" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={item.href}
                  className="cursor-pointer py-1 underline-offset-2 transition-all duration-200 hover:text-white"
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
