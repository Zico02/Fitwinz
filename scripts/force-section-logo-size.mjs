import fs from "fs";

const path = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(path, "utf8");

function replaceLogoInFunction(fnName, endMarker) {
  const start = s.indexOf(`function ${fnName}(){`);
  const end = s.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`${fnName} bounds not found`);
  const chunk = s.slice(start, end);
  const next = chunk.replace(
    /c\.jsx\("img",\{src:"\/images\/logo-full-transparent\.png",alt:"Fitwinz",className:"[^"]*"\}\)/,
    'c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"w-auto object-contain bg-transparent",style:{height:"112px",maxWidth:"170px"}})'
  );
  if (next === chunk) throw new Error(`${fnName} logo image replace failed`);
  s = s.slice(0, start) + next + s.slice(end);
}

replaceLogoInFunction("P9", "function $1(){");
replaceLogoInFunction("R9", "function F1(){");

fs.writeFileSync(path, s);
console.log("Forced explicit logo size for P9 and R9");
