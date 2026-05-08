import { Link } from "react-router-dom";
import { LogoLight } from "./Logo.jsx";

export function SiteMarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center rounded-lg outline-none ring-offset-2 ring-offset-zinc-950 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="Home"
        >
          <LogoLight size="nav" />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm">
          <Link to="/pricing" className="text-zinc-400 transition hover:text-white">
            Pricing
          </Link>
          <Link to="/login" className="cursor-pointer text-zinc-400 transition hover:text-white">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
