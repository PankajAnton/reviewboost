import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import StarRating from "../components/StarRating.jsx";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TEMPLATES_5 = [
  "Absolutely loved this place! The food was incredible and the staff made us feel so welcome. One of the best dining experiences I've had.",
  "Fantastic experience from start to finish. The flavors were spot on and the ambiance was perfect. Definitely coming back soon!",
  "Wow, just wow. Everything was perfect — the food, the service, the vibe. Highly recommend to everyone!",
];

const TEMPLATES_4 = [
  "Really enjoyed our visit! Great food and friendly staff. Would definitely recommend to friends and family.",
  "Good experience overall. The food was fresh and tasty, service was prompt. Will be coming back.",
  "Nice place with good food. The staff was attentive and the meal was satisfying. Happy with the visit.",
];

export default function ReviewPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [stars, setStars] = useState(0);
  /** rate | high | low | lowDone | highDone */
  const [step, setStep] = useState("rate");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [lowFeedback, setLowFeedback] = useState("");
  const [lowSubmitting, setLowSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [highSaving, setHighSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
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
        setLoadError("We could not find this restaurant. Check the link or QR code.");
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

  function handleStarPick(n) {
    setStars(n);
    setActionError("");
    if (n >= 4) {
      setStep("high");
      setSelectedTemplate("");
      setCopySuccess(false);
    } else if (n >= 1) {
      setStep("low");
      setLowFeedback("");
    }
  }

  async function submitLow() {
    if (!restaurant) return;
    setActionError("");
    setLowSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      restaurant_id: restaurant.id,
      stars,
      feedback: lowFeedback.trim() || "",
    });
    setLowSubmitting(false);
    if (error) {
      setActionError(error.message);
      return;
    }
    setStep("lowDone");
  }

  async function copyAndOpenMaps() {
    if (!restaurant || !selectedTemplate) return;
    setCopySuccess(false);
    setActionError("");
    setHighSaving(true);
    try {
      await navigator.clipboard.writeText(selectedTemplate);
    } catch {
      setHighSaving(false);
      setActionError(
        "Could not copy automatically. Please select the text and copy manually."
      );
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      restaurant_id: restaurant.id,
      stars,
      feedback: selectedTemplate,
    });
    setHighSaving(false);
    if (error) {
      setActionError(error.message);
      return;
    }

    setCopySuccess(true);
    window.open(restaurant.google_maps_link, "_blank", "noopener,noreferrer");
    setStep("highDone");
  }

  const templates = stars === 5 ? TEMPLATES_5 : stars === 4 ? TEMPLATES_4 : [];
  const showForm =
    restaurant && step !== "lowDone" && step !== "highDone";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-stone-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="inline-flex text-sm font-medium text-stone-600 transition hover:text-[#f97316]"
        >
          ← ReviewBoost
        </Link>

        {loading ? (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white p-10 shadow-md">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
            <p className="text-sm text-stone-600">Loading…</p>
          </div>
        ) : loadError || !restaurant ? (
          <div className="mt-10 rounded-2xl bg-white p-8 shadow-md ring-1 ring-red-100">
            <p className="text-red-700">{loadError || "Something went wrong."}</p>
          </div>
        ) : (
          <>
            {showForm ? (
              <div className="mt-8 rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200/80 sm:p-8">
                <h1 className="text-center text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
                  How was your experience at{" "}
                  <span className="text-[#f97316]">{restaurant.name}</span>?
                </h1>

                {step === "rate" || step === "high" || step === "low" ? (
                  <div className="mt-8">
                    <StarRating
                      value={stars}
                      onChange={handleStarPick}
                      label={`Rate ${restaurant.name}`}
                    />
                    {stars === 0 ? (
                      <p className="mt-6 text-center text-sm text-stone-500">
                        Tap a star to continue
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {step === "high" && stars >= 4 ? (
                  <div className="mt-10 space-y-4 border-t border-stone-100 pt-8">
                    <p className="text-center text-sm font-medium text-stone-700">
                      Pick a review that feels like you — edit later on Google if you like.
                    </p>
                    <div className="grid gap-3">
                      {templates.map((text) => (
                        <button
                          key={text.slice(0, 32)}
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(text);
                            setCopySuccess(false);
                          }}
                          className={`rounded-2xl p-4 text-left text-sm leading-relaxed shadow-md ring-1 transition hover:shadow-lg ${
                            selectedTemplate === text
                              ? "bg-amber-50 ring-[#f97316]/50"
                              : "bg-stone-50/80 ring-stone-200/80 hover:ring-[#f97316]/25"
                          }`}
                        >
                          {text}
                        </button>
                      ))}
                    </div>

                    {selectedTemplate ? (
                      <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                          Your review
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-stone-800">
                          {selectedTemplate}
                        </p>
                      </div>
                    ) : null}

                    {actionError ? (
                      <p className="text-sm text-red-600" role="alert">
                        {actionError}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      disabled={!selectedTemplate || highSaving}
                      onClick={copyAndOpenMaps}
                      className="flex w-full min-h-12 items-center justify-center rounded-2xl bg-[#f97316] font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {highSaving ? "Working…" : "Copy & Post on Google Maps"}
                    </button>
                  </div>
                ) : null}

                {step === "low" && stars >= 1 && stars <= 3 ? (
                  <div className="mt-10 space-y-4 border-t border-stone-100 pt-8">
                    <p className="text-center text-lg font-medium text-stone-800">
                      We&apos;re sorry to hear that 😔
                    </p>
                    <label className="block text-sm font-medium text-stone-700">
                      Tell us what went wrong…
                    </label>
                    <textarea
                      value={lowFeedback}
                      onChange={(e) => setLowFeedback(e.target.value)}
                      rows={5}
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                      placeholder="Your honest feedback helps us improve…"
                    />
                    {actionError ? (
                      <p className="text-sm text-red-600" role="alert">
                        {actionError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={lowSubmitting}
                      onClick={submitLow}
                      className="flex w-full min-h-12 items-center justify-center rounded-2xl bg-stone-900 font-semibold text-white shadow-md transition hover:bg-stone-800 disabled:opacity-70"
                    >
                      {lowSubmitting ? "Sending…" : "Submit feedback"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === "lowDone" ? (
              <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-md ring-1 ring-emerald-100">
                <p className="text-lg font-semibold text-emerald-900">
                  Thank you for your feedback.
                </p>
                <p className="mt-2 text-emerald-800/90">
                  We&apos;ll make it right.
                </p>
              </div>
            ) : null}

            {step === "highDone" && copySuccess ? (
              <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-md ring-1 ring-amber-100">
                <p className="text-lg font-semibold text-amber-950">
                  Review copied! Just paste it on Google Maps 😊
                </p>
                <p className="mt-3 text-sm text-amber-900/90">
                  A Maps tab should have opened — if not, ask the team for their review link.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
