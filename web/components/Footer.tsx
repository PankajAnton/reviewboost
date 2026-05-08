import Link from "next/link";
import { Logo } from "@/components/Logo";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo href="/" />
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Turn Happy Customers Into 5-Star Reviews
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-500">
            <Link
              href="/#features"
              className="cursor-pointer transition-all duration-200 hover:text-white"
            >
              Product
            </Link>
            <Link
              href="/#pricing"
              className="cursor-pointer transition-all duration-200 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="cursor-pointer transition-all duration-200 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="cursor-pointer transition-all duration-200 hover:text-white"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-zinc-800 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-600">
            © 2024 ReviewBoost · Crafted for restaurateurs
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 md:justify-end">
            {legalLinks.flatMap((item, i) => [
              ...(i > 0
                ? [
                    <span key={`sep-${item.href}`} className="text-zinc-700" aria-hidden>
                      ·
                    </span>,
                  ]
                : []),
              <Link
                key={item.href}
                href={item.href}
                className="cursor-pointer transition-all duration-200 hover:text-white"
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
