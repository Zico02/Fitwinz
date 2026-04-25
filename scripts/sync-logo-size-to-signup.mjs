import fs from "fs";

const p = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(p, "utf8");

const signupIdx = s.indexOf('children:"FITWINZ SIGNUP"');
if (signupIdx < 0) throw new Error("signup marker not found");
const signupSlice = s.slice(signupIdx - 500, signupIdx + 200);
const m = signupSlice.match(/className:"([^"]*object-contain bg-transparent[^"]*)"/);
if (!m) throw new Error("signup logo class not found");
const signupClass = m[1];

const p9Start = s.indexOf("function P9(){");
const p9End = s.indexOf("function $1(){", p9Start);
if (p9Start < 0 || p9End < 0) throw new Error("P9 bounds not found");
let p9 = s.slice(p9Start, p9End);
p9 = p9.replace(/className:"[^"]*object-contain bg-transparent[^"]*"/, `className:"${signupClass}"`);
s = s.slice(0, p9Start) + p9 + s.slice(p9End);

const r9Start = s.indexOf("function R9(){");
const r9End = s.indexOf("function F1(){", r9Start);
if (r9Start < 0 || r9End < 0) throw new Error("R9 bounds not found");
let r9 = s.slice(r9Start, r9End);
const r9First = r9.indexOf('className:"');
if (r9First < 0) throw new Error("R9 no className");
r9 = r9.replace(/className:"[^"]*object-contain bg-transparent[^"]*"/, `className:"${signupClass}"`);
s = s.slice(0, r9Start) + r9 + s.slice(r9End);

fs.writeFileSync(p, s);
console.log("Applied exact signup class:", signupClass);
