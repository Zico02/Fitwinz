import fs from "fs";
const p = "dist/assets/index-Csxc0UUK.js";
let s = fs.readFileSync(p, "utf8");

// Clean common mojibake fragments that can appear in top strip/header area
const bad = ["›Ã—", "Ã—", "â€”", "â€“", "â†’", "Â©", "Ã¢â€", "â€\u009d", "â€œ", "â€"]; 
for (const b of bad) s = s.split(b).join("");

// Also fix left-arrow mojibake variant if present
s = s.split("â† Back to shop").join("← Back to shop");

fs.writeFileSync(p, s);
console.log("Cleaned garbled header/top characters");
