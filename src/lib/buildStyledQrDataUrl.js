import QRCode from "qrcode";
import { emojiToDataUrl, loadImage } from "./emojiToDataUrl.js";
import { resolveQrStyle } from "./qrStyleConfig.js";

/**
 * Apply a rounded-rectangle clip to match "rounded corners" QR framing.
 * @param {HTMLCanvasElement} source
 */
function canvasWithRoundedMask(source) {
  const w = source.width;
  const h = source.height;
  const r = Math.min(w, h) * 0.12;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(source, 0, 0);
  return canvas;
}

/**
 * High-res PNG data URL for PDF or download — matches dashboard QR styling.
 * @param {string} reviewUrl
 * @param {string} [styleId]
 */
export async function buildStyledQrDataUrl(reviewUrl, styleId) {
  const url = reviewUrl?.trim();
  if (!url) {
    throw new Error("Review link missing");
  }

  const cfg = resolveQrStyle(styleId);
  const width = 800;

  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, {
    width,
    margin: 2,
    errorCorrectionLevel: cfg.level,
    color: { dark: cfg.fg, light: cfg.bg },
  });

  if (cfg.centerEmoji) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      try {
        const cw = canvas.width;
        const ch = canvas.height;
        const frac = 0.24;
        const ew = cw * frac;
        const ex = (cw - ew) / 2;
        const ey = (ch - ew) / 2;
        ctx.fillStyle = cfg.bg;
        ctx.fillRect(ex, ey, ew, ew);
        const dataUrl = emojiToDataUrl(cfg.centerEmoji, 512);
        const em = await loadImage(dataUrl);
        ctx.drawImage(em, ex, ey, ew, ew);
      } catch {
        /* continue without logo overlay */
      }
    }
  }

  const finalCanvas = cfg.roundedMask
    ? canvasWithRoundedMask(canvas)
    : canvas;

  return finalCanvas.toDataURL("image/png");
}
