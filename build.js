const fs = require('fs');
const path = require('path');

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
