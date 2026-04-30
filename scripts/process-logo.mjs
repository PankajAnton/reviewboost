/**
 * Turns solid/plate-black outer padding in logo.png transparent (RGBA).
 */
import sharp from "sharp";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mainLogo = path.join(root, "public", "logo.png");
const nestedLogo = path.join(root, "reviewboost", "public", "logo.png");

async function knockOutBlackFromSource(srcPath, destPath) {
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = buf[idx];
      const g = buf[idx + 1];
      const b = buf[idx + 2];
      const sum = r + g + b;
      const max = Math.max(r, g, b);
      if (sum <= 55 && max <= 28) {
        buf[idx + 3] = 0;
      }
    }
  }

  const pngBuffer = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const { writeFileSync, unlinkSync, renameSync } = await import("node:fs");
  const tmp = destPath + ".tmp";
  writeFileSync(tmp, pngBuffer);
  try {
    unlinkSync(destPath);
  } catch (_) {
    /* noop if missing */
  }
  renameSync(tmp, destPath);
}

await knockOutBlackFromSource(mainLogo, mainLogo);

if (existsSync(nestedLogo)) {
  await knockOutBlackFromSource(mainLogo, nestedLogo);
}

console.log("Logo background knocked out:", mainLogo);