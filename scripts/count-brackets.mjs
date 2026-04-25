import fs from "fs";
const t = fs.readFileSync(new URL("./trend-snippet.txt", import.meta.url), "utf8");
const body = t;
let o = 0,
  c = 0,
  sq = 0,
  br = 0;
for (const ch of body) {
  if (ch === "(") o++;
  if (ch === ")") c++;
  if (ch === "[") sq++;
  if (ch === "]") br++;
}
console.log({ parens: o - c, brackets: sq - br });
