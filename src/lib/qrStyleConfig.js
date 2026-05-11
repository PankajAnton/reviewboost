/** @typedef {'classic' | 'star' | 'smiley' | 'rounded' | 'heart'} QrStyleId */

export const QR_STYLE_IDS = [
  "classic",
  "star",
  "smiley",
  "rounded",
  "heart",
];

export const DEFAULT_QR_STYLE = "classic";

/** @type {Record<string, { fg: string; bg: string; level: 'L' | 'M' | 'Q' | 'H'; centerEmoji: string | null; roundedMask: boolean; roundedContainer: boolean }>} */
export const qrStyles = {
  classic: {
    fg: "#0f0f0f",
    bg: "#ffffff",
    level: "M",
    centerEmoji: null,
    roundedMask: false,
    roundedContainer: false,
  },
  star: {
    fg: "#f97316",
    bg: "#fff7ed",
    level: "H",
    centerEmoji: "⭐",
    roundedMask: false,
    roundedContainer: false,
  },
  smiley: {
    fg: "#f59e0b",
    bg: "#fffbeb",
    level: "H",
    centerEmoji: "😊",
    roundedMask: false,
    roundedContainer: false,
  },
  rounded: {
    fg: "#6366f1",
    bg: "#eef2ff",
    level: "H",
    centerEmoji: null,
    roundedMask: true,
    roundedContainer: true,
  },
  heart: {
    fg: "#ef4444",
    bg: "#fef2f2",
    level: "H",
    centerEmoji: "❤️",
    roundedMask: false,
    roundedContainer: false,
  },
};

/** @param {string | undefined | null} id */
export function normalizeQrStyleId(id) {
  if (id && QR_STYLE_IDS.includes(/** @type {*} */ (id))) return id;
  return DEFAULT_QR_STYLE;
}

/** @param {string | undefined | null} id */
export function resolveQrStyle(id) {
  const k = normalizeQrStyleId(id);
  return qrStyles[k] ?? qrStyles.classic;
}

const LS_KEY = (restaurantId) => `qr_style_${restaurantId}`;

export function getStoredQrStyle(restaurantId) {
  if (typeof localStorage === "undefined") return DEFAULT_QR_STYLE;
  try {
    return normalizeQrStyleId(localStorage.getItem(LS_KEY(restaurantId)));
  } catch {
    return DEFAULT_QR_STYLE;
  }
}

export function setStoredQrStyle(restaurantId, styleId) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY(restaurantId), normalizeQrStyleId(styleId));
  } catch {
    /* ignore quota */
  }
}
