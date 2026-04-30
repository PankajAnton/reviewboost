/**
 * Google-style template copy for promoters (overall average ≥ 4).
 * Resolution order: most specific combination first.
 */

const ALL_FIVES = [
  "Absolutely phenomenal! The food was outstanding, service was impeccable, and the atmosphere was electric. Easily one of the best dining experiences I've ever had. A must-visit!",
  "From the moment we walked in, everything felt special. Incredible flavors, warm staff, and a beautiful ambiance. We'll definitely be back!",
  "Perfect in every way — the food, the people, the vibe. This place has set a new standard for dining. Highly recommend!",
];

const FOOD5_SVC5_ATM4 = [
  "The food and service were absolutely top-notch. Great ambiance too — overall a wonderful evening. Would highly recommend to anyone looking for a quality meal!",
  "Exceptional food and incredibly attentive staff. Lovely atmosphere to top it off. One of our favorite spots now!",
];

const FOOD5_SVC4_ATM5 = [
  "The food blew us away and the atmosphere was stunning. Service was great too. A restaurant that truly delivers on all fronts!",
  "Amazing flavors in a beautiful setting. Staff were friendly and helpful. Definitely coming back!",
];

const FOOD4_SVC5_ATM5 = [
  "Wonderful experience — the service was exceptional and the vibe was perfect. Food was delicious too. Loved every minute!",
  "Great food, outstanding service, and a gorgeous atmosphere. This place knows how to make you feel welcome!",
];

const FOOD5_OTHERS_34 = [
  "The food here is seriously impressive — flavors were on point and portions generous. Good service and a comfortable setting. Worth visiting for the food alone!",
];

const SERVICE5_OTHERS_34 = [
  "The staff here are exceptional — so attentive and friendly. Good food and a pleasant atmosphere. The service alone makes it worth coming back!",
];

const GENERAL_FOUR_PLUS = [
  "Really enjoyed our visit! Good food, friendly staff, and a nice atmosphere. Would recommend to friends and family.",
  "Solid experience overall. The food was tasty, service was prompt, and the place had a good vibe. Will return!",
];

/**
 * @param {number} f
 * @param {number} s
 * @param {number} a
 * @returns {{ average: number, templates: string[] } | { average: number, templates: null }}
 */
export function resolvePromoterTemplates(f, s, a) {
  const average = (f + s + a) / 3;
  if (average < 4) {
    return { average, templates: null };
  }

  const in34 = (n) => n >= 3 && n <= 4;

  if (f === 5 && s === 5 && a === 5) {
    return { average, templates: ALL_FIVES };
  }
  if (f === 5 && s === 5 && a === 4) {
    return { average, templates: FOOD5_SVC5_ATM4 };
  }
  if (f === 5 && s === 4 && a === 5) {
    return { average, templates: FOOD5_SVC4_ATM5 };
  }
  if (f === 4 && s === 5 && a === 5) {
    return { average, templates: FOOD4_SVC5_ATM5 };
  }
  if (f === 5 && in34(s) && in34(a)) {
    return { average, templates: FOOD5_OTHERS_34 };
  }
  if (s === 5 && in34(f) && in34(a)) {
    return { average, templates: SERVICE5_OTHERS_34 };
  }
  return { average, templates: GENERAL_FOUR_PLUS };
}

export function roundOverallForLegacyStars(average) {
  return Math.min(5, Math.max(1, Math.round(average)));
}
