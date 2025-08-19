// build.js (ESM, único bloque de imports)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas base
const ROOT = __dirname;                  // raíz del repo
const OUT  = '/vercel/output';           // Vercel sirve desde aquí

// === Helpers de copia (definidos una sola vez) ===
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function copy(src, dest) {
  if (!fs.existsSync(src)) return;       // ignora si no existe
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
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

// === Mini “bundle” de app.js a dist/app.bundle.js (tu lógica original) ===
const srcPath  = path.join(__dirname, 'app.js');
const distDir  = path.join(__dirname, 'dist');
const outPath  = path.join(distDir, 'app.bundle.js');

const src = fs.readFileSync(srcPath, 'utf8');

// Quita comentarios // cuidando strings/plantillas
function stripComments(code) {
  let out = '';
  let inSingle = false, inDouble = false, inTemplate = false;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i], next = code[i + 1];
    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === '/' && next === '/') { while (i < code.length && code[i] !== '\n') i++; out += '\n'; continue; }
      if (ch === '\\' && next) { out += ch + next; i++; continue; }
      if (ch === "'") inSingle = true;
      else if (ch === '"') inDouble = true;
      else if (ch === '`') inTemplate = true;
      out += ch; continue;
    }
    if (ch === '\\' && next) { out += ch + next; i++; continue; }
    if (inSingle && ch === "'") inSingle = false;
    else if (inDouble && ch === '"') inDouble = false;
    else if (inTemplate && ch === '`') inTemplate = false;
    out += ch;
  }
  return out;
}

const min = stripComments(src)
  .replace(/\n+/g, '\n')
  .replace(/\s{2,}/g, ' ')
  .trim();

ensureDir(distDir);
fs.writeFileSync(outPath, min, 'utf8');
console.log(`Bundled to ${outPath} (${min.length} bytes)`);

// === Copia de estáticos al output final de Vercel (una sola vez) ===
copy(path.join(ROOT, 'index.html'),     path.join(OUT, 'index.html'));
copy(path.join(ROOT, 'styles.css'),     path.join(OUT, 'styles.css'));
copy(path.join(ROOT, 'manifest.json'),  path.join(OUT, 'manifest.json'));

copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
copyDir(path.join(ROOT, 'data'),   path.join(OUT, 'data'));
copyDir(path.join(ROOT, 'public'), path.join(OUT, '')); // incluye sw-kill.js si existe
