import fs from "fs";

const bundlePath = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(bundlePath, "utf8");

const r9Start = s.indexOf("function R9(){");
const r9End = s.indexOf("function F1(){", r9Start);
if (r9Start < 0 || r9End < 0) throw new Error("R9 bounds not found");

const termsHtml = fs.readFileSync("scripts/terms-html.txt", "utf8");
const newR9 = `function R9(){return c.jsxs("div",{className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{className:"sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100",children:c.jsx("div",{className:"max-w-5xl mx-auto px-6 py-4",children:c.jsx(Ce,{to:"/",className:"text-sm font-medium text-gray-700 hover:text-black",children:"\\u2190 Back to shop"})})}),c.jsxs("main",{className:"flex-1 w-full px-6 py-10 lg:py-14",children:[c.jsxs("div",{className:"max-w-3xl mx-auto flex flex-col items-center text-center gap-4 mb-12",children:[c.jsx("h1",{className:"text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"}),c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-20 md:h-28 w-auto object-contain bg-transparent"})})]}),c.jsx("div",{className:"text-gray-800 leading-relaxed max-w-3xl mx-auto",dangerouslySetInnerHTML:{__html:${JSON.stringify(termsHtml)}}})]}),c.jsx("footer",{className:"bg-black text-white py-8 px-6 mt-auto",children:c.jsx("div",{className:"max-w-7xl mx-auto text-center",children:c.jsx("p",{className:"text-sm text-gray-400",children:"\\u00A9 2026 Fitwinz"})})})]})}`;
s = s.slice(0, r9Start) + newR9 + s.slice(r9End);

const p9Start = s.indexOf("function P9(){");
const p9End = s.indexOf("function $1(){", p9Start);
if (p9Start < 0 || p9End < 0) throw new Error("P9 bounds not found");
let p9 = s.slice(p9Start, p9End);
p9 = p9.replace(
  /className:"h-[^\"]*w-auto object-contain bg-transparent"/,
  'className:"h-20 md:h-28 w-auto object-contain bg-transparent"'
);
s = s.slice(0, p9Start) + p9 + s.slice(p9End);

fs.writeFileSync(bundlePath, s);
console.log("Fixed P9 + R9 in bundle");
