const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'app.js');
const distDir = path.join(__dirname, 'dist');
const outPath = path.join(distDir, 'app.bundle.js');

const src = fs.readFileSync(srcPath, 'utf8');
// Very small bundler/minifier: strip comments and extra whitespace.
const min = src
  .replace(/\/\/.*$/gm, '')
  .replace(/\n+/g, '\n')
  .replace(/\s{2,}/g, ' ')
  .trim();

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outPath, min, 'utf8');
console.log(`Bundled to ${outPath} (${min.length} bytes)`);
