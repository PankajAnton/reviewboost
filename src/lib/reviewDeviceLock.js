/** Same-browser duplicate review prevention (one completed review per venue). */

export function reviewedRestaurantStorageKey(restaurantId) {
  return `rb_reviewed_${restaurantId}`;
}

export function hasSubmittedReviewOnDevice(restaurantId) {
  if (!restaurantId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(reviewedRestaurantStorageKey(restaurantId)) != null;
  } catch {
    return false;
  }
}

/** Call only after a review row is successfully saved (Supabase insert OK). */
export function markRestaurantReviewSubmitted(restaurantId) {
  if (!restaurantId || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      reviewedRestaurantStorageKey(restaurantId),
      new Date().toISOString(),
    );
  } catch {
    /* private mode / quota */
  }
}
