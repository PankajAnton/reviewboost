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
  /** Narrow brand strip — more room for venue name + QR in the middle. */
  const topH = Math.round((pageH * 15) / 100);
  const botH = Math.round(pageH / 4);
  const midH = pageH - topH - botH;

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

  /** Horizontal center of page — use with `{ align: "center" }` on every text line */
  const cx = pageW / 2;

  // ——— SECTION 1: TOP ORANGE (~15%) ———
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

  // Wordmark: horizontally centered block (Review + Boost)
  doc.setFont("helvetica", "bold");
  const logoReview = "Review";
  const logoBoost = "Boost";
  doc.setFontSize(24);
  const wRev = doc.getTextWidth(logoReview);
  const gapPx = 3;
  doc.setFontSize(24);
  const wBoost = doc.getTextWidth(logoBoost);
  const logoTotal = wRev + gapPx + wBoost;
  const logoLeft = cx - logoTotal / 2;
  const midOrange = topH / 2;
  const logoY = midOrange + 2;
  let tagLineY = logoY + 22;

  doc.setTextColor(255, 255, 255);
  doc.text(logoReview, logoLeft, logoY);
  doc.setTextColor(255, 237, 213); // warm tint on Boost (readable on orange)
  doc.text(logoBoost, logoLeft + wRev + gapPx, logoY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 252, 248);
  const tagLines = doc.splitTextToSize(
    "Smart Reviews for Smart Restaurants",
    pageW - 48,
  );
  tagLines.forEach((line) => {
    doc.text(line, cx, tagLineY, { align: "center" });
    tagLineY += 11;
  });

  // ——— SECTION 2: WHITE MID (remaining ~60%) ———
  doc.setFillColor(255, 255, 255);
  doc.rect(0, topH, pageW, midH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(28, 25, 23);

  const nameMaxW = pageW - 72;
  const nameLines = doc.splitTextToSize(venue, nameMaxW);
  const lineStep = nameLines.length > 2 ? 30 : 34;
  let cy = topH + (nameLines.length >= 3 ? 52 : 64);

  nameLines.slice(0, 5).forEach((line) => {
    doc.text(line, cx, cy, { align: "center" });
    cy += lineStep;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(113, 108, 100); // gray
  doc.text("We value your feedback", cx, cy + 6, { align: "center" });

  const afterSubtitle = cy + 6 + 14;
  const qrSize = 200;
  const midBandBot = topH + midH;
  const qrPadTop = 20;
  const qrFloorSpace = 38;
  const qrMinY = afterSubtitle + qrPadTop;
  const qrMaxY = midBandBot - qrSize - qrFloorSpace;
  let qrY = topH + midH * 0.48 - qrSize / 2;
  qrY = Math.min(Math.max(qrMinY, qrY), qrMaxY);

  const qrX = (pageW - qrSize) / 2;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(168, 162, 158);
  const hostLines = doc.splitTextToSize(hostLabel, pageW - 96);
  let hy = qrY + qrSize + 16;
  hostLines.forEach((line) => {
    doc.text(line, cx, hy, { align: "center" });
    hy += 11;
  });

  // ——— SECTION 3: DARK BOTTOM (25%) ———
  const botTop = topH + midH;
  doc.setFillColor(...FOOTER_BLACK);
  doc.rect(0, botTop, pageW, botH, "F");

  // Footer stack — fixed spacing, all horizontally centered on cx
  let fy = botTop + botH * 0.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("Scan ★★★ Rate Us", cx, fy, { align: "center" });
  fy += 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 161);
  doc.text("Takes 30 seconds • Helps us serve you better", cx, fy, {
    align: "center",
  });
  fy += 24;

  doc.setFontSize(20);
  doc.setTextColor(...ORANGE);
  doc.text("★★★★★", cx, fy, { align: "center" });
  fy += 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const footLines = doc.splitTextToSize(
    "Your honest feedback shapes our service",
    pageW - 100,
  );
  doc.text(footLines, cx, fy, {
    align: "center",
    lineHeightFactor: 1.2,
  });

  doc.save(`ReviewBoost-${sanitizeFilename(venue)}.pdf`);
}
