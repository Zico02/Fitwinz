import fs from "fs";
const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
let s = fs.readFileSync(bundlePath, "utf8");
const trendSnippet = fs.readFileSync(new URL("./trend-snippet.txt", import.meta.url), "utf8");
const tStart = s.indexOf("const H1=[");
const tEnd = s.indexOf("const D1=[");
s = s.slice(0, tStart) + trendSnippet + s.slice(tEnd);
fs.writeFileSync(new URL("../dist/assets/__trend_test__.js", import.meta.url), s);
console.log("wrote __trend_test__.js");
