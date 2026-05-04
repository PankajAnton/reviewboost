/** Effective average for a review row (aligned with low-rating email logic). */
export function effectiveReviewAverage(row) {
  if (row.overall_average != null && row.overall_average !== "") {
    const n = Number(row.overall_average);
    if (!Number.isNaN(n)) return n;
  }
  const f = row.food_stars;
  const s = row.service_stars;
  const a = row.atmosphere_stars;
  if (
    f != null &&
    s != null &&
    a != null &&
    f >= 1 &&
    f <= 5 &&
    s >= 1 &&
    s <= 5 &&
    a >= 1 &&
    a <= 5
  ) {
    return (f + s + a) / 3;
  }
  return row.stars;
}

export function filterReviewsForOwnerVenues(reviews, restaurants) {
  const ids = new Set(restaurants.map((r) => r.id));
  return reviews.filter((rev) => ids.has(rev.restaurant_id));
}

/** Split reviews into this calendar month vs previous calendar month (local time). */
export function splitByCalendarMonth(reviews, refDate = new Date()) {
  const cy = refDate.getFullYear();
  const cm = refDate.getMonth();
  const prevAnchor = new Date(cy, cm - 1, 1);
  const ly = prevAnchor.getFullYear();
  const lm = prevAnchor.getMonth();

  const thisMonth = [];
  const lastMonth = [];
  for (const r of reviews) {
    const d = new Date(r.created_at);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (y === cy && m === cm) thisMonth.push(r);
    else if (y === ly && m === lm) lastMonth.push(r);
  }
  return { thisMonth, lastMonth };
}

export function countFeedbackBuckets(rows) {
  let google = 0;
  let priv = 0;
  let low = 0;
  for (const r of rows) {
    if (r.stars >= 4) google += 1;
    else priv += 1;
    if (effectiveReviewAverage(r) <= 3 + 1e-9) low += 1;
  }
  return { total: rows.length, google, private: priv, low };
}

/** Badge copy for MoM comparison. */
export function monthOverMonthGrowth(current, previous) {
  if (previous === 0 && current === 0) {
    return { text: "—", variant: "neutral" };
  }
  if (previous === 0 && current > 0) {
    return { text: "New", variant: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) {
    return { text: "Neutral", variant: "neutral" };
  }
  const rounded = Math.round(pct * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}%`,
    variant: rounded > 0 ? "up" : "down",
  };
}
