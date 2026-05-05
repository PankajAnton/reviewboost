import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const ORANGE = [249, 115, 22]; // #f97316
const ORANGE_STRIPE = [234, 88, 12]; // #ea580c
const FOOTER_BLACK = [15, 15, 15]; // #0f0f0f

/** @returns {[number, number]} width × height in pt */
function a4PortraitPt() {
  return [595, 842];
}

function sanitizeFilename(name) {
  const s = (name || "Restaurant")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return s || "Restaurant";
}

/** Display hostname for footer under QR (no scheme). */
function displayHost(siteUrl, fallbackOrigin) {
  const raw = (siteUrl || fallbackOrigin || "").trim();
  if (!raw) return "your-site.app";
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/\/.*$/, "") || "your-site.app";
  }
}

/**
 * Premium table-tent style QR flyer — exact A4 portrait (595 × 842 pt), vector layout + crisp QR.
 */
export async function downloadReviewBoostRestaurantPdf({
  restaurantName,
  reviewUrl,
  siteUrl,
}) {
  if (!reviewUrl?.trim()) {
    throw new Error("Review link missing — set VITE_PUBLIC_APP_URL and redeploy.");
  }

  const [pageW, pageH] = a4PortraitPt();
  const topH = pageH / 4;
  const midH = pageH / 2;
  const botH = pageH - topH - midH;

  const qrPx = 800;
  const qrDataUrl = await QRCode.toDataURL(reviewUrl.trim(), {
    width: qrPx,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#0f0f0f", light: "#ffffff" },
    type: "image/png",
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
    compress: true,
  });

  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const hostLabel = displayHost(siteUrl, fallbackOrigin);
  const venue = (restaurantName || "Restaurant").trim() || "Restaurant";

  // ——— SECTION 1: TOP ORANGE (25%) ———
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageW, topH, "F");

  // Subtle diagonal texture (clipped to band)
  const stripeDiagClip = () => {
    try {
      doc.saveGraphicsState();
      doc.rect(0, 0, pageW, topH);
      doc.clip();
      doc.setDrawColor(...ORANGE_STRIPE);
      doc.setLineWidth(0.35);
      for (let i = -180; i < pageW + 220; i += 13) {
        doc.line(i, -10, i + topH + 120, topH + 10);
      }
      doc.restoreGraphicsState();
    } catch {
      doc.setDrawColor(...ORANGE_STRIPE);
      doc.setLineWidth(0.25);
      for (let row = 0; row < topH; row += 14) {
        for (let col = 0; col < pageW; col += 14) {
          doc.circle(col + 3.5, row + 3.5, 0.65, "S");
        }
      }
    }
  };
  stripeDiagClip();

  // Wordmark (vector — crisp print): Review · Boost on orange
  doc.setFont("helvetica", "bold");
  const logoReview = "Review";
  const logoBoost = "Boost";
  doc.setFontSize(30);
  const wRev = doc.getTextWidth(logoReview);
  const gapPx = 3;
  doc.setFontSize(30);
  const wBoost = doc.getTextWidth(logoBoost);
  const logoTotal = wRev + gapPx + wBoost;
  const logoLeft = pageW / 2 - logoTotal / 2;
  const logoY = topH * 0.42;

  doc.setTextColor(255, 255, 255);
  doc.text(logoReview, logoLeft, logoY);
  doc.setTextColor(255, 237, 213); // warm tint on Boost (readable on orange)
  doc.text(logoBoost, logoLeft + wRev + gapPx, logoY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(255, 252, 248);
  doc.text(
    "Smart Reviews for Smart Restaurants",
    pageW / 2,
    topH * 0.72,
    { align: "center" },
  );

  // ——— SECTION 2: WHITE MID (50%) ———
  doc.setFillColor(255, 255, 255);
  doc.rect(0, topH, pageW, midH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(28, 25, 23);

  const nameMaxW = pageW - 72;
  const nameLines = doc.splitTextToSize(venue, nameMaxW);
  const lineStep = nameLines.length > 2 ? 30 : 34;
  let cy = topH + (nameLines.length >= 3 ? 40 : 52);

  nameLines.slice(0, 5).forEach((line) => {
    doc.text(line, pageW / 2, cy, { align: "center" });
    cy += lineStep;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(113, 108, 100); // gray
  doc.text("We value your feedback", pageW / 2, cy + 6, { align: "center" });

  const afterSubtitle = cy + 6 + 14;
  const qrSize = 200;
  const midBandBot = topH + midH;
  const qrPadTop = 20;
  const qrFloorSpace = 38;
  const qrMinY = afterSubtitle + qrPadTop;
  const qrMaxY = midBandBot - qrSize - qrFloorSpace;
  let qrY = topH + midH * 0.52 - qrSize / 2;
  qrY = Math.min(Math.max(qrMinY, qrY), qrMaxY);

  doc.addImage(qrDataUrl, "PNG", (pageW - qrSize) / 2, qrY, qrSize, qrSize);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(168, 162, 158);
  doc.text(hostLabel, pageW / 2, qrY + qrSize + 22, { align: "center" });

  // ——— SECTION 3: DARK BOTTOM (25%) ———
  const botTop = topH + midH;
  doc.setFillColor(...FOOTER_BLACK);
  doc.rect(0, botTop, pageW, botH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("Scan & Rate Us", pageW / 2, botTop + botH * 0.38, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 161);
  doc.text(
    "Takes 30 seconds • Helps us serve you better",
    pageW / 2,
    botTop + botH * 0.52,
    { align: "center" },
  );

  doc.setFontSize(20);
  doc.setTextColor(...ORANGE);
  doc.text("★ ★ ★ ★ ★", pageW / 2, botTop + botH * 0.67, {
    align: "center",
  });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const footLines = doc.splitTextToSize(
    "Your honest feedback shapes our service",
    pageW - 100,
  );
  const noteLh = 9 * 1.15;
  const noteBlockH = (footLines.length - 1) * noteLh;
  const noteStartY = botTop + botH * 0.84 - noteBlockH / 2;
  doc.text(footLines, pageW / 2, noteStartY, {
    align: "center",
    lineHeightFactor: 1.15,
  });

  doc.save(`ReviewBoost-${sanitizeFilename(venue)}.pdf`);
}
