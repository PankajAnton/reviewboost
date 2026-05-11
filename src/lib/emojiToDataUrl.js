/**
 * Draw a single emoji on a canvas and return a PNG data URL (for QRCodeSVG imageSettings).
 * @param {string} emoji
 * @param {number} px canvas size (square)
 * @returns {string} data URL
 */
export function emojiToDataUrl(emoji, px = 128) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.clearRect(0, 0, px, px);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontPx = Math.round(px * 0.62);
  ctx.font = `${fontPx}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.fillText(emoji, px / 2, px / 2);
  return canvas.toDataURL("image/png");
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("Could not load image"));
    im.src = src;
  });
}
