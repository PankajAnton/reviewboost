import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import CategoryStarRow from "../components/CategoryStarRow.jsx";
import { LogoDark } from "../components/Logo.jsx";
import {
  resolvePromoterTemplates,
  roundOverallForLegacyStars,
} from "../lib/reviewTemplates.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ProgressTrack({ phase }) {
  const step =
    phase === "rate"
      ? 1
      : phase === "doneHigh" || phase === "doneLow"
        ? 3
        : 2;
  const oneDone = step > 1;
  const twoActive = step === 2;
  const twoDone = step > 2;

  return (
    <div className="mb-8 flex items-center justify-center gap-3 sm:gap-5">
      <div className="flex flex-col items-center gap-2">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition ${
            oneDone ? "bg-[#f97316] text-white" : "bg-white text-[#ea580c] ring-2 ring-[#f97316]/40"
          }`}
          aria-current={phase === "rate" ? "step" : undefined}
        >
          1
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">
          Rate
        </span>
      </div>
      <div
        className={`mb-6 h-[3px] w-10 shrink-0 rounded-full transition sm:w-14 ${
          oneDone ? "bg-[#f97316]" : "bg-stone-200"
        }`}
        aria-hidden
      />
      <div className="flex flex-col items-center gap-2">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition ${
            twoDone
              ? "bg-[#f97316] text-white"
              : twoActive
                ? "bg-white text-[#ea580c] ring-2 ring-[#f97316]/40"
                : "bg-stone-100 text-stone-400 ring-1 ring-stone-200"
          }`}
          aria-current={twoActive ? "step" : undefined}
        >
          2
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">
          Review
        </span>
      </div>
    </div>
  );
}

function buildDetractorSummary(food, service, atmosphere, fbF, fbS, fbA) {
  const lines = [];
  if (food < 4 && fbF.trim())
    lines.push(`Food: ${fbF.trim()}`);
  if (service < 4 && fbS.trim())
    lines.push(`Service: ${fbS.trim()}`);
  if (atmosphere < 4 && fbA.trim())
    lines.push(`Atmosphere: ${fbA.trim()}`);
  return lines.join("\n\n") || "(No written feedback)";
}

export default function ReviewPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);

  /** rate | promoter | detractor | doneHigh | doneLow */
  const [phase, setPhase] = useState("rate");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [feedbackFood, setFeedbackFood] = useState("");
  const [feedbackService, setFeedbackService] = useState("");
  const [feedbackAtmosphere, setFeedbackAtmosphere] = useState("");

  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      setPhase("rate");
      setFood(0);
      setService(0);
      setAtmosphere(0);
      setSelectedTemplate("");
      setFeedbackFood("");
      setFeedbackService("");
      setFeedbackAtmosphere("");
      setActionError("");

      if (!id?.trim()) {
        setLoadError("Review link is incomplete.");
        setRestaurant(null);
        setLoading(false);
        return;
      }
      if (!UUID_RE.test(id)) {
        setLoadError(
          "Yeh link valid nahi lag raha. Dashboard se naya QR / link use karein."
        );
        setRestaurant(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, google_maps_link")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setRestaurant(null);
      } else if (!data) {
        setLoadError(
          "We could not find this restaurant. Check the link or QR code."
        );
        setRestaurant(null);
      } else {
        setRestaurant(data);
        setLoadError("");
      }
      setLoading(false);
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const allRated = food > 0 && service > 0 && atmosphere > 0;

  const { average, templates } = useMemo(() => {
    if (!allRated)
      return { average: null, templates: null };
    return resolvePromoterTemplates(food, service, atmosphere);
  }, [allRated, food, service, atmosphere]);

  function handleContinueFromRate() {
    if (!allRated || average == null) return;
    setActionError("");
    setSelectedTemplate("");
    if (templates) {
      setPhase("promoter");
    } else {
      setPhase("detractor");
    }
  }

  async function submitDetractor() {
    if (!restaurant) return;
    setActionError("");
    setSubmitting(true);
    const avg = (food + service + atmosphere) / 3;
    const row = {
      restaurant_id: restaurant.id,
      stars: roundOverallForLegacyStars(avg),
      food_stars: food,
      service_stars: service,
      atmosphere_stars: atmosphere,
      overall_average: Math.round(avg * 100) / 100,
      selected_template: null,
      feedback_food: food < 4 ? feedbackFood.trim() : "",
      feedback_service: service < 4 ? feedbackService.trim() : "",
      feedback_atmosphere: atmosphere < 4 ? feedbackAtmosphere.trim() : "",
      feedback: buildDetractorSummary(
        food,
        service,
        atmosphere,
        feedbackFood,
        feedbackService,
        feedbackAtmosphere
      ),
    };

    const { error } = await supabase.from("reviews").insert(row);
    setSubmitting(false);
    if (error) {
      setActionError(error.message);
      return;
    }
    setPhase("doneLow");
  }

  async function copyAndOpenMaps() {
    const avgCombined = (food + service + atmosphere) / 3;
    if (!restaurant || !selectedTemplate) return;
    setActionError("");
    setSubmitting(true);
    try {
      await navigator.clipboard.writeText(selectedTemplate);
    } catch {
      setSubmitting(false);
      setActionError(
        "Could not copy automatically. Please select the text and copy manually."
      );
      return;
    }

    const row = {
      restaurant_id: restaurant.id,
      stars: roundOverallForLegacyStars(avgCombined),
      food_stars: food,
      service_stars: service,
      atmosphere_stars: atmosphere,
      overall_average: Math.round(avgCombined * 100) / 100,
      selected_template: selectedTemplate,
      feedback_food: "",
      feedback_service: "",
      feedback_atmosphere: "",
      feedback: selectedTemplate,
    };

    const { error } = await supabase.from("reviews").insert(row);
    setSubmitting(false);
    if (error) {
      setActionError(error.message);
      return;
    }
    setPhase("doneHigh");
    window.open(restaurant.google_maps_link, "_blank", "noopener,noreferrer");
  }

  const showLowFood = phase === "detractor" && food < 4;
  const showLowService = phase === "detractor" && service < 4;
  const showLowAtmosphere = phase === "detractor" && atmosphere < 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/90 via-stone-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-[#ea580c] sm:gap-3 sm:text-base"
        >
          <span aria-hidden className="-mt-px select-none">
            ←
          </span>
          <LogoDark size="lg" />
        </Link>

        {loading ? (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white p-10 shadow-lg ring-1 ring-stone-100">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
            <p className="text-sm text-stone-600">Loading…</p>
          </div>
        ) : loadError || !restaurant ? (
          <div className="mt-10 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-red-100">
            <p className="text-red-700">{loadError || "Something went wrong."}</p>
          </div>
        ) : (
          <>
            {(phase === "rate" ||
              phase === "promoter" ||
              phase === "detractor") && (
              <ProgressTrack phase={phase} />
            )}

            {phase === "rate" ? (
              <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-200/70 sm:p-8">
                <h1 className="text-center text-xl font-bold leading-snug tracking-tight text-stone-900 sm:text-2xl">
                  How was{" "}
                  <span className="text-[#f97316]">{restaurant.name}</span>
                  <span className="block mt-2 text-[15px] font-medium text-stone-600 sm:inline sm:mt-0 sm:before:mx-2 sm:before:content-['·']">
                    Rate each area like on Google Maps
                  </span>
                </h1>

                <div className="mt-8 grid gap-4">
                  <CategoryStarRow
                    id="food"
                    emoji="🍽️"
                    label="Food"
                    value={food}
                    onChange={setFood}
                  />
                  <CategoryStarRow
                    id="service"
                    emoji="👨‍🍳"
                    label="Service"
                    value={service}
                    onChange={setService}
                  />
                  <CategoryStarRow
                    id="atmosphere"
                    emoji="✨"
                    label="Atmosphere"
                    value={atmosphere}
                    onChange={setAtmosphere}
                  />
                </div>

                {!allRated ? (
                  <p className="mt-6 text-center text-sm font-medium text-stone-500">
                    Rate all three categories to continue.
                  </p>
                ) : (
                  <p className="mt-6 rounded-2xl bg-amber-50/90 px-4 py-3 text-center text-sm font-semibold text-amber-900 ring-1 ring-amber-100">
                    Average:{" "}
                    <span className="tabular-nums text-[#ea580c]">
                      {(average ?? 0).toFixed(1)}
                    </span>{" "}
                    / 5
                  </p>
                )}

                <button
                  type="button"
                  disabled={!allRated}
                  onClick={handleContinueFromRate}
                  className="mt-6 flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-[#f97316] text-base font-bold text-white shadow-lg transition hover:bg-[#ea580c] hover:shadow-xl disabled:pointer-events-none disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            ) : null}

            {phase === "promoter" && templates ? (
              <div className="space-y-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-200/70 sm:p-8">
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#ea580c]">
                    Step 2
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-stone-900 sm:text-2xl">
                    Pick a review that sounds like you
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    We&apos;ll copy it for Google — edit there if you like.
                  </p>
                </div>

                <div className="grid gap-3">
                  {templates.map((text, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(text);
                        setActionError("");
                      }}
                      className={`rounded-2xl px-5 py-4 text-left text-sm leading-relaxed shadow-md ring-2 transition hover:shadow-lg ${
                        selectedTemplate === text
                          ? "scale-[1.02] bg-amber-50 ring-[#f97316]"
                          : "bg-stone-50/90 ring-transparent ring-stone-200/80 hover:ring-[#f97316]/25"
                      }`}
                    >
                      {text}
                    </button>
                  ))}
                </div>

                {selectedTemplate ? (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#ea580c]">
                      Selected
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-800">
                      {selectedTemplate}
                    </p>
                  </div>
                ) : null}

                {actionError ? (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {actionError}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={!selectedTemplate || submitting}
                  onClick={copyAndOpenMaps}
                  className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-[#f97316] text-base font-bold text-white shadow-lg transition hover:bg-[#ea580c] disabled:opacity-50"
                >
                  {submitting ? "Working…" : "Copy & Open Google Maps"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhase("rate");
                    setSelectedTemplate("");
                    setActionError("");
                  }}
                  className="w-full rounded-2xl py-3 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
                >
                  ← Adjust ratings
                </button>
              </div>
            ) : null}

            {phase === "detractor" ? (
              <div className="space-y-5 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-200/70 sm:p-8">
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                    Step 2
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-stone-900 sm:text-2xl">
                    Help us improve
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Your feedback stays with the venue —{" "}
                    <span className="font-semibold text-stone-800">
                      we won&apos;t send you to Google Maps.
                    </span>
                  </p>
                </div>

                {showLowFood ? (
                  <label className="block">
                    <span className="text-sm font-bold text-stone-800">
                      🍽️ What could we improve about the food?
                    </span>
                    <textarea
                      value={feedbackFood}
                      onChange={(e) => setFeedbackFood(e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 shadow-sm outline-none ring-0 transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/18"
                      placeholder="Be honest — it helps."
                    />
                  </label>
                ) : null}

                {showLowService ? (
                  <label className="block">
                    <span className="text-sm font-bold text-stone-800">
                      👨‍🍳 How could our service be better?
                    </span>
                    <textarea
                      value={feedbackService}
                      onChange={(e) => setFeedbackService(e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/18"
                      placeholder="We read every comment."
                    />
                  </label>
                ) : null}

                {showLowAtmosphere ? (
                  <label className="block">
                    <span className="text-sm font-bold text-stone-800">
                      ✨ What would improve the atmosphere?
                    </span>
                    <textarea
                      value={feedbackAtmosphere}
                      onChange={(e) => setFeedbackAtmosphere(e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/18"
                      placeholder="Lights, noise, décor — anything counts."
                    />
                  </label>
                ) : null}

                {actionError ? (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {actionError}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={submitDetractor}
                  className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-stone-900 text-base font-bold text-white shadow-lg transition hover:bg-stone-800 disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Submit feedback"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhase("rate");
                    setActionError("");
                  }}
                  className="w-full rounded-2xl py-3 text-sm font-semibold text-stone-500 transition hover:bg-stone-50"
                >
                  ← Adjust ratings
                </button>
              </div>
            ) : null}

            {phase === "doneLow" ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-emerald-100">
                <p className="text-xl font-bold text-emerald-900">
                  Thank you for helping us improve 🙏
                </p>
                <p className="mt-3 text-emerald-800/90">
                  The team reads every comment.
                </p>
              </div>
            ) : null}

            {phase === "doneHigh" ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-amber-100">
                <p className="text-xl font-bold text-stone-900">
                  Copied — paste your review on Google Maps
                </p>
                <p className="mt-3 text-sm text-stone-600">
                  A Maps tab should have opened. If not, use the venue&apos;s
                  review link from your server.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
