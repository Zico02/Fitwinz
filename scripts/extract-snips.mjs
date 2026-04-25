import fs from "fs";
const s = fs.readFileSync(
  new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url),
  "utf8",
);
const idx = s.indexOf("MEN");
console.log(s.slice(idx, idx + 2000));
