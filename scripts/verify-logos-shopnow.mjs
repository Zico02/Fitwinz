import fs from "fs";
const s = fs.readFileSync("dist/assets/index-Csxc0UUK.js", "utf8");
console.log('new logo size present', s.includes('style:{height:"170px",maxWidth:"240px"}'));
console.log('old logo size present', s.includes('style:{height:"150px",maxWidth:"220px"}'));
console.log('garbled shop now remaining', s.includes('Shop Nowâ†') || s.includes('Shop NowÃ'));
console.log('plain Shop Now count', (s.match(/Shop Now/g)||[]).length);
