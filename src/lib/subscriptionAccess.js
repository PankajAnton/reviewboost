import { normalizeOwnerPlan } from "./plans.js";

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Whole calendar days from today (start) until subscription end day (start). Same calendar day as end → 0. */
export function calendarDaysRemaining(subscriptionEndIso) {
  if (!subscriptionEndIso || typeof subscriptionEndIso !== "string") return null;
  const end = startOfDay(new Date(subscriptionEndIso));
  const today = startOfDay(new Date());
  return Math.round((end.getTime() - today.getTime()) / 86400000);
}

export function isPastSubscriptionEnd(subscriptionEndIso) {
  const days = calendarDaysRemaining(subscriptionEndIso);
  return days !== null && days < 0;
}

/**
 * @param {Record<string, unknown> | null | undefined} profileRow
 * @returns {{ kind: 'ok' } | { kind: 'paywall'; reason: 'trial_expired' | 'subscription_expired'; markExpired: boolean }}
 */
export function getDashboardAccessDecision(profileRow) {
  if (!profileRow) return { kind: "ok" };
  const norm = normalizeOwnerPlan(profileRow);

  if (norm.subscription_status === "expired") {
    return {
      kind: "paywall",
      reason: norm.plan_type === "trial" ? "trial_expired" : "subscription_expired",
      markExpired: false,
    };
  }

  if (
    norm.subscription_end_date &&
    isPastSubscriptionEnd(norm.subscription_end_date)
  ) {
    return {
      kind: "paywall",
      reason: norm.plan_type === "trial" ? "trial_expired" : "subscription_expired",
      markExpired: true,
    };
  }

  return { kind: "ok" };
}

export function formatSubscriptionEndDate(subscriptionEndIso) {
  if (!subscriptionEndIso || typeof subscriptionEndIso !== "string") return "";
  try {
    return new Date(subscriptionEndIso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return subscriptionEndIso;
  }
}
