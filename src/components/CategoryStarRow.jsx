import { useState } from "react";

const STAR_PATH =
  "M12 2l2.91 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l7.09-1.01L12 2z";

/**
 * Single category row: emoji + label + 5 large touch stars + selected number.
 */
export default function CategoryStarRow({
  emoji,
  label,
  value,
  onChange,
  id,
}) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value;

  return (
    <div
      className="rounded-2xl bg-stone-50/80 p-4 shadow-sm ring-1 ring-stone-200/70 sm:p-5"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={`${id}-label`} className="flex items-center gap-2 text-base font-semibold text-stone-900 sm:text-lg">
          <span className="text-2xl leading-none" aria-hidden>
            {emoji}
          </span>
          {label}
        </p>
        <div
          className="min-w-[2.5rem] rounded-xl bg-white px-3 py-1 text-center text-lg font-bold tabular-nums text-[#ea580c] shadow-sm ring-1 ring-amber-100"
          role="status"
          aria-live="polite"
        >
          {value > 0 ? value : "—"}
        </div>
      </div>

      <div
        id={`${id}-stars`}
        className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const n = i + 1;
          const active = display >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${label}: ${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={value === n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(n)}
              className={`
                min-h-[44px] min-w-[44px] rounded-2xl transition-all duration-200 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2
                ${
                  active
                    ? "scale-100 bg-amber-50 shadow-md ring-2 ring-[#f97316]/45"
                    : "scale-[0.97] bg-white shadow-md ring-1 ring-stone-200/80 hover:scale-100 hover:shadow-lg hover:ring-[#f97316]/20"
                }
              `}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-11 w-11 p-1.5 transition-transform duration-200 sm:h-12 sm:w-12 ${
                  active ? "scale-110" : "scale-100"
                }`}
                aria-hidden
              >
                <path
                  d={STAR_PATH}
                  className={
                    active
                      ? "fill-[#f97316] stroke-amber-800/25"
                      : "fill-stone-200 stroke-stone-300"
                  }
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
