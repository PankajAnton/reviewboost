import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabaseClient.js";
import { getPublicAppBaseUrl, getReviewPageUrlForQr } from "../lib/appBaseUrl.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LogoDark } from "../components/Logo.jsx";

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
  const [feedbackType, setFeedbackType] = useState("all");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const loadAll = useCallback(async () => {
    if (!user?.id) return;
    setDataError("");
    setLoadingData(true);

    const [rRes, vRes] = await Promise.all([
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

    setRestaurants(rRes.data || []);
    setReviews(vRes.data || []);
    setLoadingData(false);
  }, [user?.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
      setFormError(error.message);
      return;
    }
    setName("");
    setMapsLink("");
    setLastAddedId(data.id);
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
        "../lib/generateReviewQrPdf.jsx"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-stone-50">
      <header className="border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
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
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Owner dashboard
        </h1>
        <p className="mt-1 text-stone-600">
          Add a venue, share the QR on tables, and watch feedback roll in.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80">
            <h2 className="text-lg font-semibold text-stone-900">
              Add restaurant
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Use your public Google Maps review URL so happy guests can paste in seconds.
            </p>
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
                      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
                        <div className="flex w-full shrink-0 justify-center sm:w-auto sm:justify-start">
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

                        <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-4 sm:items-stretch">
                          <p className="text-center text-lg font-bold tracking-tight text-stone-900 sm:text-left">
                            {r.name}
                          </p>
                          <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
                            <button
                              type="button"
                              disabled={Boolean(pdfBusyId) || !(scanUrl || laptopTestUrl)}
                              onClick={() =>
                                handleDownloadPdf(r, scanUrl || laptopTestUrl)
                              }
                              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[10rem]"
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
                              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[#f97316] shadow-sm ring-1 ring-[#f97316]/35 transition hover:bg-amber-50 sm:w-auto sm:min-w-[10rem]"
                            >
                              {scanUrl ? "Test review page" : "Open on this PC"}
                            </a>
                          </div>
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
