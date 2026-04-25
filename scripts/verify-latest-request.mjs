import fs from "fs";
const s = fs.readFileSync("dist/assets/index-Csxc0UUK.js", "utf8");
console.log("logo style present", s.includes('style:{height:"150px",maxWidth:"220px"}'));
console.log("terms centered", s.includes('text-gray-800 leading-relaxed max-w-3xl mx-auto text-center'));
console.log("new email", s.includes('fitwinz2@gmail.com'));
console.log("old email", s.includes('support@fitwinz.com'));
