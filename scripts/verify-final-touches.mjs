import fs from "fs";
const s = fs.readFileSync("dist/assets/index-Csxc0UUK.js", "utf8");
console.log("has 132x200", s.includes('style:{height:"132px",maxWidth:"200px"}'));
console.log("has 112x170", s.includes('style:{height:"112px",maxWidth:"170px"}'));
console.log("terms heading md:text-5xl", s.includes('className:"text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"'));
console.log("bad copyright", s.includes("Â© 2026 Fitwinz") || s.includes("Ã‚Â© 2026 Fitwinz"));
console.log("clean copyright", s.includes("© 2026 Fitwinz") || s.includes("\\u00A9 2026 Fitwinz"));
