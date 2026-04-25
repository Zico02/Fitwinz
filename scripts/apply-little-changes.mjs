import fs from "fs";

const p = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(p, "utf8");

function rep(from, to, label) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: expected 1 got ${n}`);
  s = s.replace(from, to);
}

const p9Start = s.indexOf("function P9(){");
const p9End = s.indexOf("function $1(){", p9Start);
if (p9Start < 0 || p9End < 0) throw new Error("P9 bounds");
const newP9 = 'function P9(){return c.jsx("section",{id:"philosophy",className:"scroll-mt-28 bg-gradient-to-b from-zinc-50 via-white to-white py-16 px-6 lg:px-10",children:c.jsxs("div",{className:"max-w-6xl mx-auto text-center",children:[c.jsx("h2",{className:"text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4",children:"Our Philosophy"}),c.jsx("div",{className:"flex justify-center mb-6",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-20 md:h-28 w-auto object-contain bg-transparent"})}),c.jsxs("div",{className:"space-y-3 text-gray-700 leading-snug text-sm md:text-base max-w-4xl mx-auto",children:[c.jsx("p",{children:"Fitwinz is a Moroccan brand founded with a clear vision: to create sportswear that combines performance, comfort, and a healthier approach to clothing."}),c.jsx("p",{children:"We design our products using natural materials such as wool, linen, and organic cotton, focusing on comfort, breathability, and durability. Our approach avoids synthetic fabrics; we aim to use materials that feel better on the skin and align with a healthier lifestyle."}),c.jsx("p",{children:"Founded by twins, Fitwinz reflects a commitment to quality, creating sportswear that connects movement, well-being, and nature."})]}),c.jsx("p",{className:"mt-8 text-center text-base md:text-xl font-semibold text-gray-900 max-w-3xl mx-auto leading-snug",children:"Fitwinz is more than sportswear \\u2014 it\\u2019s a way to train, move, and live better."})]})})}';
s = s.slice(0, p9Start) + newP9 + s.slice(p9End);

rep(
  'c.jsxs("div",{className:"max-w-3xl mx-auto flex flex-col items-center text-center gap-5 mb-12",children:[c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-20 md:h-28 w-auto object-contain bg-transparent"})}),c.jsx("h1",{className:"text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"})]})',
  'c.jsxs("div",{className:"max-w-3xl mx-auto flex flex-col items-center text-center gap-4 mb-12",children:[c.jsx("h1",{className:"text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"}),c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-20 md:h-28 w-auto object-contain bg-transparent"})})]})',
  "terms reorder"
);

rep(
  'c.jsx("h2",{"code-path":"src/sections/PopularSection.tsx:97:9",className:"text-2xl md:text-3xl font-bold text-gray-900",children:"TRENDING NOW"})',
  'c.jsxs("div",{children:[c.jsx("span",{className:"text-xs font-semibold text-gray-500 tracking-wider mb-2 block",children:"WOMEN"}),c.jsx("h2",{"code-path":"src/sections/PopularSection.tsx:97:9",className:"text-2xl md:text-3xl font-bold text-gray-900",children:"TRENDING NOW"})]})',
  "women pre-label"
);

fs.writeFileSync(p, s);
console.log("little tweaks applied");




