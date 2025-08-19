// build.js - versión final para Vercel
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpetas raíz y output
const ROOT = __dirname;
const OUT = path.join(ROOT, "vercel", "output");

// Helpers
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function copy(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}
function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  for (const entry of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, entry);
    const d = path.join(destDir, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else copy(s, d);
  }
}

// (Opcional) mini “bundle” de app.js → genera /dist/app.bundle.js
try {
  const srcPath = path.join(ROOT, "app.js");
  if (fs.existsSync(srcPath)) {
    const distDir = path.join(ROOT, "dist");
    const outPath = path.join(distDir, "app.bundle.js");
    const src = fs.readFileSync(srcPath, "utf8");
    const min = src
      .replace(/\/\/[^\n]*\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim();
    ensureDir(distDir);
    fs.writeFileSync(outPath, min, "utf8");
    console.log(`Bundled to ${outPath} (${min.length} bytes)`);
  }
} catch (e) {
  console.warn("Skip bundle step:", e?.message);
}

// Copia carpetas y archivos al output
copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
copyDir(path.join(ROOT, "data"), path.join(OUT, "data"));
copyDir(path.join(ROOT, "dist"), path.join(OUT, "dist"));
copyDir(path.join(ROOT, "public"), OUT);

copy(path.join(ROOT, "styles.css"), path.join(OUT, "styles.css"));
copy(path.join(ROOT, "index.html"), path.join(OUT, "index.html"));
copy(path.join(ROOT, "manifest.json"), path.join(OUT, "manifest.json"));

console.log("✅ Build Completed in /vercel/output");
