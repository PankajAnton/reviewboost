import { Link } from "react-router-dom";
import { planDisplayLabel } from "../lib/plans.js";
import {
  calendarDaysRemaining,
  formatSubscriptionEndDate,
} from "../lib/subscriptionAccess.js";

/**
 * Trial / paid reminder banners below the dashboard chrome.
 * @param {{ ownerPlan: ReturnType<typeof import("../lib/plans.js").normalizeOwnerPlan> }} props
 */
export default function DashboardPlanBanners({ ownerPlan }) {
  const trialDays =
    ownerPlan.plan_type === "trial" &&
    ownerPlan.subscription_status === "trial" &&
    ownerPlan.subscription_end_date
      ? calendarDaysRemaining(ownerPlan.subscription_end_date)
      : null;

  const paidDays =
    (ownerPlan.plan_type === "starter" || ownerPlan.plan_type === "growth") &&
    ownerPlan.subscription_status === "active" &&
    ownerPlan.subscription_end_date
      ? calendarDaysRemaining(ownerPlan.subscription_end_date)
      : null;

  const blocks = [];

  if (
    trialDays !== null &&
    trialDays >= 0 &&
    ownerPlan.plan_type === "trial" &&
    ownerPlan.subscription_status === "trial"
  ) {
    const upgrade = (
      <Link
        to="/paywall"
        className="font-semibold underline decoration-[#f97316] underline-offset-2 hover:text-[#ea580c]"
      >
        Upgrade to Starter →
      </Link>
    );

    if (trialDays > 7) {
      blocks.push(
        <div
          key="trial-blue"
          className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-950 shadow-sm"
        >
          🎉 Free Trial: {trialDays} days remaining | {upgrade}
        </div>
      );
    } else if (trialDays >= 4 && trialDays <= 7) {
      blocks.push(
        <div
          key="trial-orange"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm"
        >
          ⚡ Only {trialDays} days left in trial! Upgrade now to keep access →{" "}
          <Link
            to="/paywall"
            className="underline decoration-[#ea580c] underline-offset-2 hover:text-[#c2410c]"
          >
            Paywall
          </Link>
        </div>
      );
    } else if (trialDays >= 1 && trialDays <= 3) {
      blocks.push(
        <div
          key="trial-red"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 shadow-sm"
        >
          🚨 Trial ending in {trialDays} days! Upgrade now or lose access →{" "}
          <Link
            to="/paywall"
            className="underline underline-offset-2 hover:text-red-950"
          >
            Upgrade
          </Link>
        </div>
      );
    } else if (trialDays === 0) {
      blocks.push(
        <div
          key="trial-today"
          className="rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950 shadow-sm"
        >
          🚨 Your trial expires TODAY!{" "}
          <Link
            to="/paywall"
            className="underline underline-offset-2 hover:text-red-900"
          >
            Upgrade now →
          </Link>
        </div>
      );
    }
  }

  if (
    (ownerPlan.plan_type === "starter" || ownerPlan.plan_type === "growth") &&
    ownerPlan.subscription_status === "active" &&
    ownerPlan.subscription_end_date
  ) {
    const until = formatSubscriptionEndDate(ownerPlan.subscription_end_date);
    blocks.push(
      <div
        key="paid-green"
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 shadow-sm"
      >
        ✓ {planDisplayLabel(ownerPlan.plan_type)} active until {until}
      </div>
    );

    if (
      paidDays !== null &&
      paidDays >= 0 &&
      paidDays < 7
    ) {
      blocks.push(
        <div
          key="paid-orange"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm"
        >
          ⚡ Subscription ending on {until}.{" "}
          <Link
            to="/paywall"
            className="underline decoration-[#ea580c] underline-offset-2 hover:text-[#c2410c]"
          >
            Renew now →
          </Link>
        </div>
      );
    }
  }

  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200/80 bg-white/95 px-4 py-4 ps-[max(1rem,env(safe-area-inset-left,0px))] pe-[max(1rem,env(safe-area-inset-right,0px))] sm:px-6 sm:ps-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pe-[max(1.5rem,env(safe-area-inset-right,0px))]">
      {blocks}
    </div>
  );
}
