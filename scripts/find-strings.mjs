import fs from "fs";
const s = fs.readFileSync(
  new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url),
  "utf8",
);
const needles = [
  "wishlist",
  "WISHLIST",
  "Don't have",
  "Already have",
  "/wishlist",
  'path:"/wishlist',
  "logo-full-transparent",
  "Checkout",
  "CHECKOUT",
  "section-trending",
  "section-men",
  "accessories",
  "function _1",
  "TRENDING NOW",
];
for (const n of needles) {
  const i = s.indexOf(n);
  console.log(n, i);
}
