import fs from "fs";

const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
const outPath = new URL("./p9-function.txt", import.meta.url);

const s = fs.readFileSync(bundlePath, "utf8");
const a = s.indexOf("function P9(){");
const sub = s.slice(a, a + 4000);
const marker = "function $1(){const[u,f]=b.useState(0)";
const rel = sub.indexOf(marker);
if (rel < 0) throw new Error("P9 end marker not found");
const body = sub.slice(0, rel);
fs.writeFileSync(outPath, body);
console.log("wrote", body.length, "bytes to p9-function.txt");
