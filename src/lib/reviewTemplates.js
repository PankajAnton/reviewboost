/**
 * Google-style template copy for promoters (overall average ≥ 4).
 * Pools use [RESTAURANT]; the review page substitutes the real name and shows 3 random picks.
 */

const ALL_5_STAR_TEMPLATES = [
  "[RESTAURANT] never disappoints! Every visit feels special — the food is consistently amazing and the team is so warm and welcoming.",
  "Had a wonderful dinner at [RESTAURANT]. Portions were generous, flavors were spot on, and service was attentive without being intrusive.",
  "[RESTAURANT] is our family's go-to spot now. Food quality is top notch and the staff always makes us feel at home.",
  "Visited [RESTAURANT] for the first time and absolutely loved it. Fresh ingredients, bold flavors, great ambiance. Will definitely be back!",
  "The team at [RESTAURANT] really knows how to take care of their guests. Exceptional food and even better service.",
  "Best meal I've had in a long time! [RESTAURANT] sets the bar really high. Highly recommend to everyone.",
  "[RESTAURANT] exceeded all expectations. From the moment we walked in to the last bite — everything was perfect.",
  "Such a gem! [RESTAURANT] has the perfect blend of great food, good vibes, and friendly staff. A must visit for everyone!",
  "Absolutely phenomenal experience at [RESTAURANT]. The flavors were incredible and the staff went above and beyond. Can't wait to come back!",
  "[RESTAURANT] is simply outstanding. Great food, wonderful ambiance, and service that makes you feel truly valued. Highly recommended!",
];

const ALL_4_STAR_TEMPLATES = [
  "Really enjoyed our time at [RESTAURANT]. Good food, pleasant atmosphere, and helpful staff. Would definitely recommend!",
  "[RESTAURANT] is a solid choice for a good meal out. Food was tasty and service was prompt and friendly.",
  "Had a great experience at [RESTAURANT]. Food was fresh and flavorful, staff was very accommodating throughout.",
  "[RESTAURANT] offers a good dining experience overall. Nice ambiance, good food, and attentive service.",
  "We enjoyed our visit to [RESTAURANT]. Food was well prepared and staff made us feel welcome throughout.",
  "Good food and comfortable setting at [RESTAURANT]. Will definitely recommend to friends and family.",
  "[RESTAURANT] is a reliable spot for a satisfying meal. Consistent quality and good service every time.",
  "Visited [RESTAURANT] recently and had a pleasant experience. Fresh food, quick service, and a nice atmosphere overall.",
  "[RESTAURANT] impressed us with their food quality and friendly service. A great place for a family dinner or casual outing.",
  "Solid experience at [RESTAURANT]. The food hit the spot and the staff were attentive and courteous throughout our visit.",
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

  const stars = roundOverallForLegacyStars(average);
  if (stars === 5) {
    return { average, templates: ALL_5_STAR_TEMPLATES };
  }
  return { average, templates: ALL_4_STAR_TEMPLATES };
}

export function roundOverallForLegacyStars(average) {
  return Math.min(5, Math.max(1, Math.round(average)));
}
