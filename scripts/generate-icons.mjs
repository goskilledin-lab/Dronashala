// Rasterizes scripts/icon-source.svg into the PWA icon set (§9 of the
// master build doc): 192/512 "any" + 192/512 "maskable" variants, plus a
// browser-tab favicon. Run with `node scripts/generate-icons.mjs`.

import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

const svg = readFileSync(join(__dirname, "icon-source.svg"));

const targets = [
  { file: "pwa-192.png", size: 192 },
  { file: "pwa-512.png", size: 512 },
  { file: "maskable-192.png", size: 192 },
  { file: "maskable-512.png", size: 512 },
];

for (const { file, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(publicDir, file));
  console.log(`wrote public/${file}`);
}

// Favicon: same monogram, as SVG (crisp at any tab size).
const { copyFileSync } = await import("node:fs");
copyFileSync(join(__dirname, "icon-source.svg"), join(publicDir, "favicon.svg"));
console.log("wrote public/favicon.svg");
