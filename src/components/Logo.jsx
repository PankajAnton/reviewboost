/**
 * ReviewBoost wordmark — inline SVG bubble + star, SaaS-style dual-tone text.
 */

const BUBBLE_DARK = "#1a1a2e";
const ORANGE = "#f97316";
const STAR_ORANGE = "#ea580c";

function BubbleGlyph({ bubbleFill, bubbleStroke, starFill, className = "" }) {
  const stroke =
    bubbleStroke === "none" || bubbleStroke === undefined ? undefined : bubbleStroke;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 52"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        fill={bubbleFill}
        stroke={stroke}
        strokeWidth={stroke ? 1 : undefined}
        strokeLinejoin="round"
        d="M14.5 8h22.5a4.5 4.5 0 0 1 4.5 4.5v19.2a4.5 4.5 0 0 1-4.5 4.5h-8.7l-6.4 9.8-.6-9.8h-6.8a4.5 4.5 0 0 1-4.5-4.5V12.5a4.5 4.5 0 0 1 4.5-4.5Z"
      />
      <path
        fill={starFill}
        d="M27.82 18.97 L29.363 23.096 L33.764 23.289 L30.317 26.031 L31.494 30.276 L27.82 27.845 L24.146 30.276 L25.324 26.031 L21.876 23.289 L26.277 23.096 Z"
      />
    </svg>
  );
}

const SIZE_CLASS = {
  sm: "h-8 w-8 sm:h-9 sm:w-9",
  md: "h-9 w-9 sm:h-10 sm:w-10",
  lg: "h-10 w-10 sm:h-11 sm:w-11",
  xl: "h-11 w-11 sm:h-12 sm:w-12",
  nav: "h-10 w-10 sm:h-11 sm:w-11",
  hero: "h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20",
  auth: "h-16 w-16 sm:h-20 sm:w-20",
};

const TEXT_CLASS = {
  sm: "text-base sm:text-lg",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
  xl: "text-xl font-bold tracking-tight sm:text-2xl sm:font-bold sm:tracking-tight",
  nav: "text-lg font-semibold tracking-tight sm:text-2xl",
  hero: "text-2xl font-bold tracking-tight sm:text-3xl md:text-[2.375rem]",
  auth: "text-3xl font-bold tracking-tight sm:text-4xl",
};

const PALETTE = {
  dark: {
    bubble: BUBBLE_DARK,
    stroke: "none",
    star: ORANGE,
    review: "#0c0a09",
    boost: STAR_ORANGE,
    reviewCls: "text-stone-950",
  },
  light: {
    bubble: "#ffffff",
    stroke: "rgba(15,23,42,0.12)",
    star: ORANGE,
    review: "#ffffff",
    boost: "#fdba74",
    reviewCls: "text-white",
  },
  /** White bubble — for saturated brand strips (e.g. orange PDF header). */
  brand: {
    bubble: "#ffffff",
    stroke: "rgba(26,26,46,0.12)",
    star: ORANGE,
    review: "#0c0a09",
    boost: STAR_ORANGE,
    reviewCls: "text-stone-950",
  },
};

/**
 * @param {object} props
 * @param {'dark' | 'light' | 'brand'} [props.variant='dark']
 * @param {'sm'|'md'|'lg'|'xl'|'nav'|'hero'|'auth'} [props.size='md']
 * @param {boolean} [props.showWordmark=true]
 * @param {boolean} [props.inline] — inline styles only (iframe / PDF; no reliance on Tailwind for colors)
 * @param {number} [props.pdfIconPx]
 * @param {string} [props.className]
 * @param {string} [props.iconClassName]
 */
export default function Logo({
  variant = "dark",
  size = "md",
  showWordmark = true,
  inline = false,
  pdfIconPx,
  className = "",
  iconClassName = "",
}) {
  const p = PALETTE[variant] ?? PALETTE.dark;

  const iconSizeClass =
    pdfIconPx != null ? "" : `${SIZE_CLASS[size] ?? SIZE_CLASS.md} ${iconClassName}`;

  const svgBox =
    pdfIconPx != null ? (
      <div
        style={{ width: pdfIconPx, height: pdfIconPx * (52 / 48) }}
        className={`shrink-0 ${iconClassName}`}
      >
        <BubbleGlyph
          bubbleFill={p.bubble}
          bubbleStroke={p.stroke}
          starFill={p.star}
          className="h-full w-full"
        />
      </div>
    ) : (
      <BubbleGlyph
        bubbleFill={p.bubble}
        bubbleStroke={p.stroke}
        starFill={p.star}
        className={iconSizeClass}
      />
    );

  if (!showWordmark) {
    return <span className={`inline-flex items-center ${className}`}>{svgBox}</span>;
  }

  if (inline) {
    const textPx =
      size === "hero"
        ? { fontSize: "clamp(26px, 4vw, 38px)" }
        : size === "auth"
          ? { fontSize: "clamp(28px, 5vw, 42px)" }
          : size === "nav"
            ? { fontSize: "clamp(22px, 3vw, 32px)" }
            : { fontSize: "20px" };

    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        {svgBox}
        <span
          className="font-bold tracking-tight"
          style={{
            ...textPx,
            display: "inline-flex",
            alignItems: "baseline",
            gap: 0,
            letterSpacing: "-0.035em",
            fontFamily:
              '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          <span style={{ color: p.review }}>Review</span>
          <span style={{ color: p.boost }}>Boost</span>
        </span>
      </span>
    );
  }

  const textScale = TEXT_CLASS[size] ?? TEXT_CLASS.md;

  return (
    <span className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      {svgBox}
      <span className={`inline-flex items-baseline gap-0 tracking-tight ${textScale}`}>
        <span className={`font-bold ${p.reviewCls}`}>Review</span>
        <span className="font-bold" style={{ color: p.boost }}>
          Boost
        </span>
      </span>
    </span>
  );
}

export function LogoLight(props) {
  return <Logo variant="light" {...props} />;
}

export function LogoDark(props) {
  return <Logo variant="dark" {...props} />;
}

export function LogoBrand(props) {
  return <Logo variant="brand" {...props} />;
}
