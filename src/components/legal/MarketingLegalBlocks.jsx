import { Link } from "react-router-dom";

export function LegalSection({ title, children }) {
  return (
    <section className="scroll-mt-24 pt-10 first:pt-0">
      <h2 className="mb-4 text-xl font-bold leading-snug text-white">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}

export function LegalHighlight({ children }) {
  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.08] p-5 text-sm leading-relaxed text-orange-200">
      {children}
    </div>
  );
}

export function LegalLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-orange-400 underline-offset-2 transition-colors duration-200 hover:underline"
    >
      {children}
    </Link>
  );
}
