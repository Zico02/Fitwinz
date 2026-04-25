import fs from "fs";

const p = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(p, "utf8");

// Increase section logos a little more
s = s.replaceAll('style:{height:"150px",maxWidth:"220px"}', 'style:{height:"170px",maxWidth:"240px"}');

// Fix corrupted Shop Now label(s)
s = s.replaceAll('Shop Nowâ†’', 'Shop Now');
s = s.replaceAll('Shop NowÃ¢â€ ', 'Shop Now');
s = s.replaceAll('Shop Nowâ†', 'Shop Now');

fs.writeFileSync(p, s);
console.log('Applied bigger logos + fixed Shop Now text');
