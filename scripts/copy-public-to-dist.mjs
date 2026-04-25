import fs from "fs";
import path from "path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const distDir = path.join(root, "dist");

const filesToCopy = [
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "apple-touch-icon.png",
];

if (!fs.existsSync(publicDir)) {
  throw new Error(`Missing public directory: ${publicDir}`);
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

for (const file of filesToCopy) {
  const from = path.join(publicDir, file);
  const to = path.join(distDir, file);
  if (!fs.existsSync(from)) {
    throw new Error(`Missing required file: ${from}`);
  }
  fs.copyFileSync(from, to);
}

console.log("Copied SEO/icon files from public to dist.");
