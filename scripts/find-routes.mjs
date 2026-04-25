import fs from "fs";
const s = fs.readFileSync(
  new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url),
  "utf8",
);
for (const k of ["/login", "function F1", "function $1", "Fa,", "Routes"]) {
  console.log(k, s.indexOf(k));
}
