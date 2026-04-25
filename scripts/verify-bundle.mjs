import fs from "fs";

const s = fs.readFileSync(
  new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url),
  "utf8",
);
const checks = [
  ["DRESS comma gone", !s.includes("DRESS HEALTHY,")],
  ["Morocco", s.includes("Morocco")],
  ["Use as a guest", s.includes("Use as a guest")],
  ["B1 trending href", s.includes("href:#section-trending-now")],
  ["J1.slice men", s.includes("J1.slice(0,4)")],
  ["accessories jh", s.includes('id:"accessories"')],
  ["terms max-w-5xl", s.includes("max-w-5xl")],
  ["footer pipe", s.includes("© 2026 Fitwinz | Founded by AHAJI Zakariae |")],
];
for (const [k, v] of checks) console.log(k, v);
