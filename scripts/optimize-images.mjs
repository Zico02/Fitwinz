// Converts source photos to optimized WebP files in public/images.
//
// Usage: node scripts/optimize-images.mjs <source-dir> [file ...]
//   - With no file list, converts every .jpg/.jpeg/.png in <source-dir>.
//   - Output keeps the base name: foo.png -> public/images/foo.webp
//
// next/image resizes further per device at request time; this step only
// keeps the originals committed to the repo small.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_EDGE = 1600;
const QUALITY = 80;

const [srcDir, ...only] = process.argv.slice(2);
if (!srcDir) {
  console.error("Usage: node scripts/optimize-images.mjs <source-dir> [file ...]");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public", "images");
fs.mkdirSync(outDir, { recursive: true });

const files = (only.length ? only : fs.readdirSync(srcDir)).filter((f) =>
  /\.(jpe?g|png)$/i.test(f),
);

let before = 0;
let after = 0;
for (const file of files) {
  const input = path.join(srcDir, file);
  const output = path.join(outDir, file.replace(/\.(jpe?g|png)$/i, ".webp"));
  await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, alphaQuality: 90, effort: 6 })
    .toFile(output);
  const a = fs.statSync(input).size;
  const b = fs.statSync(output).size;
  before += a;
  after += b;
  console.log(`${file.padEnd(32)} ${(a / 1024).toFixed(0).padStart(6)} KB -> ${(b / 1024).toFixed(0).padStart(5)} KB`);
}
console.log(`\nTotal: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(2)} MB`);
