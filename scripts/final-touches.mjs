import fs from "fs";

const p = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(p, "utf8");

// 1) Slightly bigger logo in Philosophy + Terms
s = s.replaceAll('style:{height:"112px",maxWidth:"170px"}', 'style:{height:"132px",maxWidth:"200px"}');

// 2) Terms heading same size family as Our Philosophy
s = s.replace(
  'className:"text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"',
  'className:"text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"'
);

// 3) Fix bad copyright encoding if present
s = s.replaceAll('Â© 2026 Fitwinz', '© 2026 Fitwinz');
s = s.replaceAll('Ã‚Â© 2026 Fitwinz', '© 2026 Fitwinz');

fs.writeFileSync(p, s);
console.log('Applied: bigger logos + terms title size + footer encoding fix');
