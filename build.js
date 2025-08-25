// build.js — Vercel SPA build (v14)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: Vercel expects ABSOLUTE path "/vercel/output"
const ROOT = __dirname;
const OUT  = "/vercel/output";

// helpers
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
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d);
    else copy(s, d);
  }
}

// (optional) tiny bundle for app.js → /dist/app.bundle.js
try {
  const srcPath = path.join(ROOT, "app.js");
  if (fs.existsSync(srcPath)) {
    const distDir = path.join(ROOT, "dist");
    const outPath = path.join(distDir, "app.bundle.js");
    const src = fs.readFileSync(srcPath, "utf8");
    const min = src.replace(/\/\/[^\n]*\n/g, "\n").replace(/\n{2,}/g, "\n").trim();
    ensureDir(distDir);
    fs.writeFileSync(outPath, min, "utf8");
    console.log(`Bundled to ${outPath} (${min.length} bytes)`);
  }
} catch (e) {
  console.warn("Skip bundle:", e?.message);
}

// ✅ Generate /dist/config.js exactly as app.js needs
try {
  const distDir = path.join(ROOT, "dist");
  ensureDir(distDir);

  const token   = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const buildId = "v14";

  const cfg = `// generated at build time
export const MAPBOX_TOKEN = ${JSON.stringify(token)};
export const BUILD_ID = ${JSON.stringify(buildId)};
export function getBuildId(){ return BUILD_ID; }`;

  fs.writeFileSync(path.join(distDir, "config.js"), cfg, "utf8");
  console.log("Wrote dist/config.js");
} catch (e) {
  console.warn("Skip dist/config.js:", e?.message);
}

// copy site to Vercel static output
copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
copyDir(path.join(ROOT, "data"),   path.join(OUT, "data"));
copyDir(path.join(ROOT, "dist"),   path.join(OUT, "dist"));
copyDir(path.join(ROOT, "public"), OUT);

copy(path.join(ROOT, "map.js"),    path.join(OUT, "map.js"));
copy(path.join(ROOT, "styles.css"),path.join(OUT, "styles.css"));
copy(path.join(ROOT, "index.html"),path.join(OUT, "index.html"));
copy(path.join(ROOT, 'sw-v14.js'), path.join(OUT, 'sw-v14.js'));
copy(path.join(ROOT, "manifest.json"), path.join(OUT, "manifest.json"));

console.log("✅ Build Completed in /vercel/output");
