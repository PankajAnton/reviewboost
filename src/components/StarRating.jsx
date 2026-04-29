import { useState } from "react";

const STAR_PATH =
  "M12 2l2.91 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l7.09-1.01L12 2z";

export default function StarRating({
  value,
  onChange,
  max = 5,
  size = "lg",
  label = "Rate your experience",
}) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value;

  const dim =
    size === "lg"
      ? "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.25rem] md:w-[4.25rem]"
      : "h-10 w-10";

  return (
    <div
      className="flex flex-col items-center gap-4"
      role="group"
      aria-label={label}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {Array.from({ length: max }, (_, i) => {
          const n = i + 1;
          const active = display >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={value === n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(n)}
              className={`
                ${dim} rounded-2xl transition-all duration-200 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2
                ${
                  active
                    ? "scale-100 bg-amber-50 shadow-md ring-2 ring-[#f97316]/40"
                    : "scale-95 bg-white shadow-md hover:scale-100 hover:shadow-lg"
                }
              `}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-full w-full p-2 transition-transform duration-200 ${
                  active ? "scale-110" : "scale-100"
                }`}
                aria-hidden
              >
                <path
                  d={STAR_PATH}
                  className={
                    active
                      ? "fill-[#f97316] stroke-amber-700/30"
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
