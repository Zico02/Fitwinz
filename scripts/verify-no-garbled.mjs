import fs from "fs";
const s = fs.readFileSync("dist/assets/index-Csxc0UUK.js", "utf8");
const suspects = ["›Ã", "Ã—", "Â©", "â†", "Ã¢", "â€”", "â€“"];
for (const t of suspects) console.log(t, s.includes(t));
