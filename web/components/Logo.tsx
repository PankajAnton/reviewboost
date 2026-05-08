import Link from "next/link";
import { cn } from "@/lib/cn";

function LogoGlyph({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800",
        className,
      )}
      aria-hidden
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-orange-500"
      >
        <path
          d="M8 21c-.6 0-1-.4-1-1V11c0-.6.4-1 1-1 .2 0 .4.1.6.2l11 6c.4.3.6.8.6 1.3s-.2 1-.6 1.3l-11 6c-.2.1-.4.2-.6.2Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M16.5 7.2l1.4 2.9 3.1.4-2.2 2.1.5 3.1-2.8-1.5-2.8 1.5.5-3.1-2.2-2.1 3.1-.4 1.4-2.9Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 transition-all duration-200",
        className,
      )}
    >
      <LogoGlyph className="transition-transform duration-200 group-hover:scale-[1.03]" />
      <span className="font-display text-xl font-extrabold tracking-tight">
        <span className="text-zinc-50">Review</span>
        <span className="text-orange-500">Boost</span>
      </span>
    </Link>
  );
}
