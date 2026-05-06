/** @typedef {'trial' | 'starter' | 'growth'} PlanType */

/** @param {unknown} row */
export function normalizeOwnerPlan(row) {
  const plan_type =
    row && typeof row.plan_type === "string" && row.plan_type
      ? row.plan_type
      : "trial";
  const allowed = new Set(["trial", "starter", "growth"]);
  const pt = allowed.has(plan_type) ? plan_type : "trial";

  const raw =
    row?.restaurant_limit != null ? Number(row.restaurant_limit) : null;
  let restaurant_limit = 1;
  if (raw === 1 || raw === 3 || raw === 10) {
    restaurant_limit = raw;
  } else if (pt === "starter") {
    restaurant_limit = 3;
  } else if (pt === "growth") {
    restaurant_limit = 10;
  }

  const subscription_status =
    row && typeof row.subscription_status === "string" && row.subscription_status
      ? row.subscription_status
      : "trial";

  const subscription_end_date =
    row && typeof row.subscription_end_date === "string"
      ? row.subscription_end_date
      : row?.subscription_end_date ?? null;

  return {
    plan_type: /** @type {PlanType} */ (pt),
    restaurant_limit,
    subscription_status,
    subscription_end_date,
  };
}

/** @param {PlanType | string} planType */
export function planDisplayLabel(planType) {
  switch (planType) {
    case "starter":
      return "Starter Plan";
    case "growth":
      return "Growth Plan";
    case "trial":
    default:
      return "Trial Plan";
  }
}

/** @param {PlanType | string} planType */
export function planUsageBannerLine(planType, usedCount, limit) {
  const label = planDisplayLabel(planType);
  return `${label}: ${usedCount}/${limit} restaurants used`;
}
