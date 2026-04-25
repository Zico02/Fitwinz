import fs from "fs";

const p = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(p, "utf8");

const authClass = 'h-20 md:h-28 w-auto mx-auto object-contain bg-transparent mb-4';
const sectionClass = 'h-20 md:h-28 w-auto object-contain bg-transparent';

function replaceNear(marker, newClass, label) {
  const i = s.indexOf(marker);
  if (i < 0) throw new Error(`${label}: marker not found`);
  const start = Math.max(0, i - 1300);
  const end = Math.min(s.length, i + 1300);
  const chunk = s.slice(start, end);
  const replaced = chunk.replace(/className:"[^"]*object-contain bg-transparent[^"]*"/, `className:"${newClass}"`);
  if (replaced === chunk) throw new Error(`${label}: logo class not found near marker`);
  s = s.slice(0, start) + replaced + s.slice(end);
}

replaceNear('children:"FITWINZ LOGIN"', authClass, 'login');
replaceNear('children:"FITWINZ SIGNUP"', authClass, 'signup');
replaceNear('children:"Our Philosophy"', sectionClass, 'philosophy');
replaceNear('children:"TERMS \\u0026 CONDITIONS"', sectionClass, 'terms');

fs.writeFileSync(p, s);
console.log('Updated all four logos to h-20 md:h-28');
