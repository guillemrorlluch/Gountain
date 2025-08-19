import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate CommonJS __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.join(__dirname, 'app.js');
const distDir = path.join(__dirname, 'dist');
const outPath = path.join(distDir, 'app.bundle.js');

const src = fs.readFileSync(srcPath, 'utf8');

// Strip inline comments while preserving URL fragments like "https://".
// This tiny state machine skips over content inside string literals so that
// "//" sequences within them are not mistaken for comments.
function stripComments(code) {
  let out = '';
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];

    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === '/' && next === '/') {
        // Skip until end of line
        while (i < code.length && code[i] !== '\n') i++;
        out += '\n';
        continue;
      }
      if (ch === '\\' && next) {
        out += ch + next;
        i++;
        continue;
      }
      if (ch === "'") inSingle = true;
      else if (ch === '"') inDouble = true;
      else if (ch === '`') inTemplate = true;
      out += ch;
      continue;
    }

    if (ch === '\\' && next) {
      out += ch + next;
      i++;
      continue;
    }
    if (inSingle && ch === "'") inSingle = false;
    else if (inDouble && ch === '"') inDouble = false;
    else if (inTemplate && ch === '`') inTemplate = false;

    out += ch;
  }
  return out;
}

// Very small bundler/minifier: strip comments and extra whitespace.
const min = stripComments(src)
  .replace(/\n+/g, '\n')
  .replace(/\s{2,}/g, ' ')
  .trim();

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outPath, min, 'utf8');
console.log(`Bundled to ${outPath} (${min.length} bytes)`);

// build.js
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT = '/vercel/output'; // Vercel recoge de aquí

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function copy(src, dest) {
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

// ✅ Copia HTML/CSS/JS y estáticos al output final
copy(path.join(ROOT, 'index.html'), path.join(OUT, 'index.html'));
copy(path.join(ROOT, 'styles.css'), path.join(OUT, 'styles.css'));
copy(path.join(ROOT, 'manifest.json'), path.join(OUT, 'manifest.json'));

// si tienes assets (iconos, imágenes…)
copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));

// si sirves data estática (JSON)
copyDir(path.join(ROOT, 'data'), path.join(OUT, 'data'));

// si tienes /public con archivos (incluye el sw-kill.js temporal)
copyDir(path.join(ROOT, 'public'), path.join(OUT, ''));

