import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabaseClient.js";
import { getPublicAppBaseUrl, getReviewPageUrlForQr } from "../lib/appBaseUrl.js";
import { useAuth } from "../context/AuthContext.jsx";

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
          "id, stars, feedback, created_at, restaurant_id, restaurants ( name )"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-stone-50">
      <header className="border-b border-stone-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-stone-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f97316] text-xs font-bold text-white shadow-md">
              RB
            </span>
            ReviewBoost
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
          <h2 className="text-lg font-semibold text-stone-900">All feedback</h2>
          <p className="mt-1 text-sm text-stone-600">
            Low ratings stay private. High ratings are counted as guided Google moments.
          </p>

          {loadingData ? null : reviews.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">No entries yet.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-2xl border border-stone-200/80 bg-stone-50/40 px-4 py-4 transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                    {new Date(rev.created_at).toLocaleString()} · {rev.stars} stars
                  </p>
                  {rev.feedback ? (
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">
                      {rev.feedback}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-stone-400">No text provided</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
