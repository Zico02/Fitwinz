import fs from "fs";

const bundle = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(bundle, "utf8");

// 1) Increase both section logos a little more
s = s.replaceAll('style:{height:"132px",maxWidth:"200px"}', 'style:{height:"150px",maxWidth:"220px"}');

// 2) Center Terms content text similar to Philosophy
s = s.replace(
  'className:"text-gray-800 leading-relaxed max-w-3xl mx-auto",dangerouslySetInnerHTML',
  'className:"text-gray-800 leading-relaxed max-w-3xl mx-auto text-center",dangerouslySetInnerHTML'
);

// 3) Update support email
s = s.replaceAll('support@fitwinz.com', 'fitwinz2@gmail.com');

fs.writeFileSync(bundle, s);

// Keep source terms html in sync too
const termsPath = "scripts/terms-html.txt";
let t = fs.readFileSync(termsPath, "utf8");
t = t.replaceAll('support@fitwinz.com', 'fitwinz2@gmail.com');
fs.writeFileSync(termsPath, t);

console.log('Applied: bigger logos + centered Terms text + email update');
