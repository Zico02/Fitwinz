import fs from "fs";

const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
let s = fs.readFileSync(bundlePath, "utf8");

const start = s.indexOf('m.trim()&&c.jsxs("div",{className:"mt-8"');
const end = s.indexOf(']}),T&&c.jsxs(c.Fragment');
if (start < 0 || end < 0 || end <= start) throw new Error(`bounds ${start} ${end}`);

const fixed = `m.trim()&&c.jsxs("div",{className:"mt-8",children:[c.jsx("h3",{className:"text-sm font-semibold text-gray-900 mb-3",children:"RESULTS"}),Qw1.length===0?c.jsx("p",{className:"text-sm text-gray-500",children:"No matches for your search."}):c.jsx("ul",{className:"space-y-2 max-h-[50vh] overflow-y-auto",children:Qw1.map(D=>c.jsx("li",{key:D.id,children:c.jsxs(Ce,{to:"/",onClick:()=>x(!1),className:"block rounded-xl border border-gray-100 p-3 hover:bg-gray-50",children:[c.jsx("p",{className:"text-sm font-semibold text-gray-900",children:D.name}),c.jsx("p",{className:"text-xs text-gray-500 mt-1",children:[D.fit,D.color].filter(Boolean).join(" \\u2022 ")})]})}))})]})`;

s = s.slice(0, start) + fixed + s.slice(end);
fs.writeFileSync(bundlePath, s);
console.log("fixed search block", start, end);
