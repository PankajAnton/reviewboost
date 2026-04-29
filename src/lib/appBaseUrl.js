/**
 * Base URL for links / QR codes shown to customers (review page).
 * MUST be reachable from a phone’s browser when someone scans the QR.
 *
 * Priority:
 * 1. Browser localStorage (set from Dashboard on localhost — fixes phone scan)
 * 2. VITE_PUBLIC_APP_URL in .env
 * 3. window.location.origin
 */
export const PUBLIC_APP_URL_STORAGE_KEY = "reviewboost_public_app_url";

function trimTrailingSlash(s) {
  return s.replace(/\/$/, "");
}

function isValidHttpUrl(s) {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function getPublicAppBaseUrl() {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PUBLIC_APP_URL_STORAGE_KEY);
      if (raw && isValidHttpUrl(raw)) {
        return trimTrailingSlash(raw.trim());
      }
    } catch {
      /* ignore */
    }
  }

  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return trimTrailingSlash(fromEnv.trim());
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }
  return "";
}

export function setStoredPublicAppUrl(url) {
  const t = (url || "").trim();
  if (!t) {
    clearStoredPublicAppUrl();
    return;
  }
  if (!isValidHttpUrl(t)) {
    throw new Error("URL must start with http:// or https://");
  }
  try {
    localStorage.setItem(PUBLIC_APP_URL_STORAGE_KEY, trimTrailingSlash(t));
  } catch (e) {
    throw new Error("Could not save URL");
  }
}

export function clearStoredPublicAppUrl() {
  try {
    localStorage.removeItem(PUBLIC_APP_URL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isLocalhostDev() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

/** Hosts phones cannot open when scanned (QR would be useless). */
export function isLoopbackBaseUrl(base) {
  if (!base || typeof base !== "string") return true;
  try {
    const h = new URL(base.trim()).hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  } catch {
    return true;
  }
}

/**
 * Full /r/:id URL for QR / customer phones. Null if base is localhost only
 * (until user saves LAN URL or sets VITE_PUBLIC_APP_URL).
 */
export function getReviewPageUrlForQr(restaurantId) {
  const base = getPublicAppBaseUrl();
  if (!restaurantId || !base) return null;
  if (isLoopbackBaseUrl(base)) return null;
  return `${trimTrailingSlash(base)}/r/${restaurantId}`;
}
