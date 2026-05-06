import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabaseClient.js";
import { getPublicAppBaseUrl, getReviewPageUrlForQr } from "../lib/appBaseUrl.js";
import { normalizeOwnerPlan, planUsageBannerLine } from "../lib/plans.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LogoDark } from "../components/Logo.jsx";
import {
  filterReviewsForOwnerVenues,
  splitByCalendarMonth,
  countFeedbackBuckets,
  monthOverMonthGrowth,
} from "../lib/dashboardMetrics.js";

function GrowthPill({ badge }) {
  const cls =
    badge.variant === "up"
      ? "bg-emerald-100 text-emerald-800"
      : badge.variant === "down"
        ? "bg-red-50 text-red-700"
        : "bg-stone-100 text-stone-600";
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {badge.text}
    </span>
  );
}

function DashboardMetricCard({ iconBg, childrenIcon, label, value, badge }) {
  return (
    <div className="relative rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100/80">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {childrenIcon}
        </div>
        <GrowthPill badge={badge} />
      </div>
      <p className="mt-4 text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-stone-900">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataError, setDataError] = useState("");
  const [formError, setFormError] = useState("");
  const [lastAddedId, setLastAddedId] = useState(null);
  const [pdfBusyId, setPdfBusyId] = useState(null);
  /** "" = all locations */
  const [feedbackRestaurantId, setFeedbackRestaurantId] = useState("");
  /** "" = monthly report for all venues combined; otherwise one restaurant */
  const [reportVenueId, setReportVenueId] = useState("");
  const [feedbackType, setFeedbackType] = useState("all");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  /** Venue being edited in “Your QR codes” — null when not editing */
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMapsLink, setEditMapsLink] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEditId, setSavingEditId] = useState(null);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState(null);
  const [ownerPlan, setOwnerPlan] = useState(() => normalizeOwnerPlan(null));

  const loadAll = useCallback(async () => {
    if (!user?.id) return;
    setDataError("");
    setLoadingData(true);

    const [pRes, rRes, vRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "plan_type, restaurant_limit, subscription_status, subscription_end_date"
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("restaurants")
        .select("id, name, google_maps_link, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select(
          "id, stars, feedback, created_at, restaurant_id, food_stars, service_stars, atmosphere_stars, overall_average, selected_template, feedback_food, feedback_service, feedback_atmosphere, restaurants ( name )"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (pRes.error) {
      setDataError(pRes.error.message);
      setLoadingData(false);
      return;
    }
    if (rRes.error) {
      setDataError(rRes.error.message);
      setLoadingData(false);
      return;
    }
    if (vRes.error) {
      setDataError(vRes.error.message);
      setLoadingData(false);
      return;
    }

    setOwnerPlan(normalizeOwnerPlan(pRes.data));
    setRestaurants(rRes.data || []);
    setReviews(vRes.data || []);
    setLoadingData(false);
  }, [user?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (
      reportVenueId &&
      !restaurants.some((r) => r.id === reportVenueId)
    ) {
      setReportVenueId("");
    }
  }, [restaurants, reportVenueId]);

  async function handleLogout() {
    const ok = window.confirm(
      "Are you sure you want to log out? You will need to sign in again to use the dashboard."
    );
    if (!ok) return;
    await supabase.auth.signOut();
  }

  async function handleAddRestaurant(e) {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !mapsLink.trim()) {
      setFormError("Please enter restaurant name and Google Maps review link.");
      return;
    }
    if (restaurants.length >= ownerPlan.restaurant_limit) {
      setFormError(
        "You’ve reached your restaurant limit for your current plan. Upgrade to add more venues."
      );
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        owner_id: user.id,
        name: name.trim(),
        google_maps_link: mapsLink.trim(),
      })
      .select("id")
      .single();

    setSaving(false);
    if (error) {
      const msg = error.message || "";
      if (msg.includes("RESTAURANT_LIMIT_REACHED")) {
        setFormError(
          "You’ve reached your restaurant limit. Upgrade your plan to add more venues."
        );
      } else {
        setFormError(msg);
      }
      return;
    }
    setName("");
    setMapsLink("");
    setLastAddedId(data.id);
    await loadAll();
  }

  function startEditRestaurant(r) {
    setEditError("");
    setEditingRestaurantId(r.id);
    setEditName(r.name);
    setEditMapsLink(r.google_maps_link);
  }

  function cancelEditRestaurant() {
    setEditingRestaurantId(null);
    setEditName("");
    setEditMapsLink("");
    setEditError("");
  }

  async function handleSaveRestaurantEdit(e, restaurantId) {
    e.preventDefault();
    setEditError("");
    if (!editName.trim() || !editMapsLink.trim()) {
      setEditError("Please enter restaurant name and Google Maps review link.");
      return;
    }
    setSavingEditId(restaurantId);
    const { error } = await supabase
      .from("restaurants")
      .update({
        name: editName.trim(),
        google_maps_link: editMapsLink.trim(),
      })
      .eq("id", restaurantId)
      .eq("owner_id", user.id);

    setSavingEditId(null);
    if (error) {
      setEditError(error.message);
      return;
    }
    cancelEditRestaurant();
    await loadAll();
  }

  async function handleDeleteRestaurant(r) {
    const ok = window.confirm(
      `Delete "${r.name}" and all feedback collected for this venue? This cannot be undone.`
    );
    if (!ok) return;
    if (editingRestaurantId === r.id) cancelEditRestaurant();
    setDeletingRestaurantId(r.id);
    setDataError("");
    const { error } = await supabase.from("restaurants").delete().eq("id", r.id);
    setDeletingRestaurantId(null);
    if (error) {
      setDataError(error.message);
      alert(error.message || "Could not delete this venue.");
      return;
    }
    if (feedbackRestaurantId === r.id) setFeedbackRestaurantId("");
    if (lastAddedId === r.id) setLastAddedId(null);
    await loadAll();
  }

  function reviewLabel(stars) {
    if (stars >= 4) return "Google Reviews Sent";
    return "Private Feedback";
  }

  function restaurantNameFromReview(row) {
    const nested = row.restaurants;
    if (nested && typeof nested === "object" && nested.name) return nested.name;
    const r = restaurants.find((x) => x.id === row.restaurant_id);
    return r?.name || "Restaurant";
  }

  async function handleDownloadPdf(r, reviewUrl) {
    if (!reviewUrl?.trim()) return;
    setPdfBusyId(r.id);
    try {
      const { downloadReviewBoostRestaurantPdf } = await import(
        "../lib/generateReviewQrPdf.js"
      );
      await downloadReviewBoostRestaurantPdf({
        restaurantName: r.name,
        reviewUrl,
        siteUrl: getPublicAppBaseUrl() || window.location.origin,
      });
    } catch (err) {
      alert(err?.message || "Could not generate PDF. Try again.");
    } finally {
      setPdfBusyId(null);
    }
  }

  async function handleDeleteReview(reviewId, restaurantLabel) {
    const ok = window.confirm(
      `Delete this feedback for "${restaurantLabel}"? This cannot be undone.`
    );
    if (!ok) return;
    setDeletingReviewId(reviewId);
    setDataError("");
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    setDeletingReviewId(null);
    if (error) {
      setDataError(error.message);
      alert(
        error.message ||
          "Could not delete. Apply the Supabase migration for reviews_delete_owner."
      );
      return;
    }
    await loadAll();
  }

  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (feedbackRestaurantId) {
      list = list.filter((r) => r.restaurant_id === feedbackRestaurantId);
    }

    if (feedbackType === "promoter") {
      list = list.filter((r) => r.stars >= 4);
    } else if (feedbackType === "private") {
      list = list.filter((r) => r.stars < 4);
    }

    const q = feedbackSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const name =
          typeof r.restaurants === "object" && r.restaurants?.name
            ? r.restaurants.name
            : restaurants.find((x) => x.id === r.restaurant_id)?.name || "";
        const blob = [
          name,
          r.feedback,
          r.feedback_food,
          r.feedback_service,
          r.feedback_atmosphere,
          r.selected_template,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    return list;
  }, [
    reviews,
    restaurants,
    feedbackRestaurantId,
    feedbackType,
    feedbackSearch,
  ]);

  const monthlySnapshot = useMemo(() => {
    let ownerReviews = filterReviewsForOwnerVenues(reviews, restaurants);
    if (reportVenueId) {
      ownerReviews = ownerReviews.filter((r) => r.restaurant_id === reportVenueId);
    }
    const { thisMonth, lastMonth } = splitByCalendarMonth(ownerReviews);
    const cur = countFeedbackBuckets(thisMonth);
    const prev = countFeedbackBuckets(lastMonth);
    const ref = new Date();
    const curMonthTitle = ref.toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
    const prevAnchor = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
    const prevMonthTitle = prevAnchor.toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });

    const venueName = reportVenueId
      ? restaurants.find((x) => x.id === reportVenueId)?.name ?? null
      : null;

    return {
      cur,
      prev,
      badges: {
        total: monthOverMonthGrowth(cur.total, prev.total),
        google: monthOverMonthGrowth(cur.google, prev.google),
        priv: monthOverMonthGrowth(cur.private, prev.private),
        low: monthOverMonthGrowth(cur.low, prev.low),
      },
      curMonthTitle,
      prevMonthTitle,
      lastMonthCount: prev.total,
      thisMonthCount: cur.total,
      scopeLabel: venueName ? venueName : "All venues",
      isAllVenues: !reportVenueId,
    };
  }, [reviews, restaurants, reportVenueId]);

  const restaurantLimitReached =
    !loadingData && restaurants.length >= ownerPlan.restaurant_limit;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-stone-50">
      <header className="border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              aria-label="ReviewBoost home"
              className="flex shrink-0 items-center rounded-lg transition hover:opacity-90"
            >
              <LogoDark size="nav" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-12 rounded-2xl bg-stone-100 px-5 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-200"
            >
              Log out
            </button>
          </div>
          {!loadingData && !dataError ? (
            <p className="mt-3 text-sm font-semibold text-stone-700">
              {planUsageBannerLine(
                ownerPlan.plan_type,
                restaurants.length,
                ownerPlan.restaurant_limit
              )}
            </p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Owner dashboard
        </h1>
        <p className="mt-1 text-stone-600">
          Add a venue, share the QR on tables, and watch feedback roll in.
        </p>

        {!loadingData && !dataError ? (
          <section
            className="mt-8 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-100 sm:p-8"
            style={{
              backgroundImage: "radial-gradient(#e7e5e4 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-stone-900">
                  Monthly report
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  <span className="font-semibold text-[#ea580c]">
                    {monthlySnapshot.scopeLabel}
                  </span>
                  {monthlySnapshot.isAllVenues ? (
                    <span className="text-stone-500"> · Combined</span>
                  ) : null}
                  {" · "}
                  <span className="font-semibold text-stone-800">
                    {monthlySnapshot.curMonthTitle}
                  </span>{" "}
                  vs{" "}
                  <span className="text-stone-700">{monthlySnapshot.prevMonthTitle}</span>
                  {" · "}
                  Growth vs last month on each card.
                </p>
              </div>
              <label className="block w-full shrink-0 lg:max-w-xs lg:pt-0.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Report for
                </span>
                <select
                  value={reportVenueId}
                  onChange={(e) => setReportVenueId(e.target.value)}
                  disabled={restaurants.length === 0}
                  className="mt-1.5 w-full min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25 disabled:opacity-50"
                >
                  <option value="">All venues (combined)</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 text-xs font-medium text-stone-500">
              Pick one venue to see its own counts — or leave &quot;All venues&quot; for totals together.
              {" "}
              Low ratings = average ≤ 3★.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardMetricCard
                iconBg="bg-orange-100 text-orange-600"
                badge={monthlySnapshot.badges.total}
                label="Total feedback"
                value={monthlySnapshot.cur.total}
                childrenIcon={
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                }
              />
              <DashboardMetricCard
                iconBg="bg-sky-100 text-sky-600"
                badge={monthlySnapshot.badges.google}
                label="Google path (4–5★)"
                value={monthlySnapshot.cur.google}
                childrenIcon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                }
              />
              <DashboardMetricCard
                iconBg="bg-violet-100 text-violet-600"
                badge={monthlySnapshot.badges.priv}
                label="Private feedback (&lt;4★)"
                value={monthlySnapshot.cur.private}
                childrenIcon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                }
              />
              <DashboardMetricCard
                iconBg="bg-amber-100 text-amber-700"
                badge={monthlySnapshot.badges.low}
                label="Low ratings (≤3★ avg)"
                value={monthlySnapshot.cur.low}
                childrenIcon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                }
              />
            </div>

            <p className="mt-5 text-center text-xs text-stone-500 sm:text-left">
              <span className="font-medium text-stone-600">
                {monthlySnapshot.scopeLabel}
              </span>
              {": "}
              last month{" "}
              <strong className="text-stone-700">
                {monthlySnapshot.prev.total.toLocaleString("en-IN")}
              </strong>{" "}
              entries · This month{" "}
              <strong className="text-stone-700">
                {monthlySnapshot.cur.total.toLocaleString("en-IN")}
              </strong>
            </p>
          </section>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
            <h2 className="text-lg font-semibold text-stone-900">
              Add restaurant
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Use your public Google Maps review URL so happy guests can paste in seconds.
            </p>

            {loadingData ? (
              <div className="mt-8 flex flex-col items-center gap-3 py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                <p className="text-sm text-stone-500">Loading your plan…</p>
              </div>
            ) : restaurantLimitReached ? (
              <div className="mt-6 space-y-5 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-6 ring-1 ring-amber-100">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    You&apos;ve reached your restaurant limit
                  </h3>
                  {ownerPlan.plan_type === "growth" ? (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      Your Growth plan supports up to{" "}
                      {ownerPlan.restaurant_limit} venues. Remove a location to add a new one, or contact us if you need more capacity.
                    </p>
                  ) : (
                    <>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        Upgrade to Growth to add up to{" "}
                        <span className="font-semibold text-stone-800">
                          10 restaurants
                        </span>
                        , with priority support.
                      </p>
                      <Link
                        to="/paywall"
                        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
                      >
                        Upgrade to Growth — ₹899/month
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddRestaurant} className="mt-6 space-y-4">
                {formError ? (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                    {formError}
                  </div>
                ) : null}
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Restaurant name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full min-h-12 rounded-2xl border border-stone-200 bg-stone-50/50 px-4 outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                    placeholder="e.g. Spice Route Kitchen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Google Maps review link
                  </label>
                  <input
                    value={mapsLink}
                    onChange={(e) => setMapsLink(e.target.value)}
                    className="mt-1.5 w-full min-h-12 rounded-2xl border border-stone-200 bg-stone-50/50 px-4 outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full min-h-12 rounded-2xl bg-[#f97316] font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:opacity-70"
                >
                  {saving ? "Saving…" : "Save & generate QR"}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
            <h2 className="text-lg font-semibold text-stone-900">
              Your QR codes
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Scan opens your branded review flow for that location.
            </p>

            {loadingData ? (
              <div className="mt-8 flex flex-col items-center gap-3 py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                <p className="text-sm text-stone-500">Loading venues…</p>
              </div>
            ) : dataError ? (
              <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {dataError}{" "}
                <span className="block mt-2 text-xs text-red-600/90">
                  If this is your first run, apply <code className="rounded bg-red-100 px-1">supabase/schema.sql</code> and confirm your API keys in <code className="rounded bg-red-100 px-1">.env</code>.
                </span>
              </div>
            ) : restaurants.length === 0 ? (
              <p className="mt-8 text-sm text-stone-500">
                No restaurants yet — add one to see the QR preview here.
              </p>
            ) : (
              <ul className="mt-6 space-y-6">
                {restaurants.map((r) => {
                  const scanUrl = getReviewPageUrlForQr(r.id);
                  const laptopTestUrl = `${window.location.origin}/r/${r.id}`;
                  const highlight = lastAddedId === r.id;
                  return (
                    <li
                      key={r.id}
                      className={`rounded-2xl p-5 ring-1 transition sm:p-6 ${
                        highlight
                          ? "bg-amber-50/80 ring-[#f97316]/50 shadow-md"
                          : "bg-stone-50/50 ring-stone-200/80"
                      }`}
                    >
                      <div className="flex w-full flex-col items-center gap-5">
                        {editingRestaurantId === r.id ? (
                          <form
                            onSubmit={(e) => handleSaveRestaurantEdit(e, r.id)}
                            className="w-full max-w-md space-y-3"
                          >
                            {editError ? (
                              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                                {editError}
                              </div>
                            ) : null}
                            <div>
                              <label className="block text-xs font-medium text-stone-600">
                                Restaurant name
                              </label>
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="mt-1 w-full min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-stone-600">
                                Google Maps review link
                              </label>
                              <input
                                value={editMapsLink}
                                onChange={(e) => setEditMapsLink(e.target.value)}
                                className="mt-1 w-full min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="submit"
                                disabled={savingEditId === r.id}
                                className="min-h-11 flex-1 rounded-xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c] disabled:opacity-60"
                              >
                                {savingEditId === r.id ? "Saving…" : "Save changes"}
                              </button>
                              <button
                                type="button"
                                disabled={savingEditId === r.id}
                                onClick={cancelEditRestaurant}
                                className="min-h-11 flex-1 rounded-xl border-2 border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <h3 className="w-full max-w-md px-2 text-center text-xl font-bold leading-snug tracking-tight text-stone-900 sm:text-2xl">
                            {r.name}
                          </h3>
                        )}

                        <div className="flex justify-center">
                          <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-stone-100">
                            {scanUrl ? (
                              <QRCodeSVG
                                value={scanUrl}
                                size={140}
                                level="M"
                                includeMargin
                                bgColor="#ffffff"
                                fgColor="#1c1917"
                              />
                            ) : (
                              <div className="flex size-[140px] flex-col items-center justify-center gap-2 rounded-xl bg-stone-100 p-3 text-center text-xs font-medium text-stone-600">
                                QR tab banega jab public URL set ho (
                                <code className="rounded bg-white px-0.5">VITE_PUBLIC_APP_URL</code> build ke waqt).
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex w-full max-w-md flex-col gap-3">
                          <button
                            type="button"
                            disabled={Boolean(pdfBusyId) || !(scanUrl || laptopTestUrl)}
                            onClick={() =>
                              handleDownloadPdf(r, scanUrl || laptopTestUrl)
                            }
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <svg
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            {pdfBusyId === r.id ? "Generating…" : "Download PDF"}
                          </button>
                          <a
                            href={scanUrl || laptopTestUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
                          >
                            {scanUrl ? "Test review page" : "Open on this PC"}
                          </a>
                          {editingRestaurantId !== r.id ? (
                            <div className="grid w-full grid-cols-2 gap-3">
                              <button
                                type="button"
                                disabled={Boolean(deletingRestaurantId) || Boolean(pdfBusyId)}
                                onClick={() => startEditRestaurant(r)}
                                className="inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-2xl border-2 border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Edit venue
                              </button>
                              <button
                                type="button"
                                disabled={
                                  deletingRestaurantId === r.id ||
                                  Boolean(pdfBusyId) ||
                                  savingEditId === r.id
                                }
                                onClick={() => handleDeleteRestaurant(r)}
                                className="inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-2xl border-2 border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingRestaurantId === r.id ? "Deleting…" : "Delete venue"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-12 rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
          <h2 className="text-lg font-semibold text-stone-900">Feedback</h2>
          <p className="mt-1 text-sm text-stone-600">
            Filter by venue and type — delete entries you don&apos;t need.
          </p>

          {!loadingData && restaurants.length > 0 && reviews.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block sm:col-span-2 lg:col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Restaurant
                  </span>
                  <select
                    value={feedbackRestaurantId}
                    onChange={(e) => setFeedbackRestaurantId(e.target.value)}
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                  >
                    <option value="">All locations</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Type
                  </span>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                  >
                    <option value="all">All</option>
                    <option value="promoter">Google / high rating</option>
                    <option value="private">Private (&lt;4★)</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Search in text
                  </span>
                  <input
                    type="search"
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    placeholder="Keyword in review or feedback…"
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                  />
                </label>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                Showing <strong className="text-stone-700">{filteredReviews.length}</strong> of{" "}
                <strong className="text-stone-700">{reviews.length}</strong>{" "}
                {reviews.length === 1 ? "entry" : "entries"}.
              </p>
            </div>
          ) : null}

          {loadingData ? null : reviews.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">No entries yet.</p>
          ) : filteredReviews.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">
              No feedback matches these filters — try another restaurant or clear search.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {filteredReviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-2xl border border-stone-200/80 bg-stone-50/40 px-4 py-4 transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-stone-900">
                          {restaurantNameFromReview(rev)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            rev.stars >= 4
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {reviewLabel(rev.stars)}
                        </span>
                      </div>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(rev.created_at).toLocaleString()} ·{" "}
                    {rev.food_stars != null &&
                    rev.service_stars != null &&
                    rev.atmosphere_stars != null ? (
                      <>
                        🍽️ {rev.food_stars} · 👨‍🍳 {rev.service_stars} · ✨{" "}
                        {rev.atmosphere_stars}
                        {rev.overall_average != null ? (
                          <>
                            {" "}
                            · avg {Number(rev.overall_average).toFixed(1)}
                          </>
                        ) : null}
                      </>
                    ) : (
                      <>{rev.stars} stars overall</>
                    )}
                  </p>
                  {rev.food_stars != null ? (
                    <>
                      {rev.feedback_food ? (
                        <p className="mt-1 text-sm text-stone-600">
                          <span className="font-medium text-stone-700">Food:</span>{" "}
                          {rev.feedback_food}
                        </p>
                      ) : null}
                      {rev.feedback_service ? (
                        <p className="mt-1 text-sm text-stone-600">
                          <span className="font-medium text-stone-700">Service:</span>{" "}
                          {rev.feedback_service}
                        </p>
                      ) : null}
                      {rev.feedback_atmosphere ? (
                        <p className="mt-1 text-sm text-stone-600">
                          <span className="font-medium text-stone-700">Atmosphere:</span>{" "}
                          {rev.feedback_atmosphere}
                        </p>
                      ) : null}
                      {rev.selected_template ? (
                        <p className="mt-2 text-sm leading-relaxed text-stone-700">
                          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Google template
                          </span>
                          <br />
                          {rev.selected_template}
                        </p>
                      ) : null}
                      {!rev.selected_template &&
                      rev.feedback &&
                      !rev.feedback_food &&
                      !rev.feedback_service &&
                      !rev.feedback_atmosphere ? (
                        <p className="mt-2 text-sm leading-relaxed text-stone-700">
                          {rev.feedback}
                        </p>
                      ) : null}
                    </>
                  ) : rev.feedback ? (
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">
                      {rev.feedback}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-stone-400">No text provided</p>
                  )}
                    </div>
                    <button
                      type="button"
                      disabled={deletingReviewId === rev.id}
                      onClick={() =>
                        handleDeleteReview(rev.id, restaurantNameFromReview(rev))
                      }
                      className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingReviewId === rev.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
