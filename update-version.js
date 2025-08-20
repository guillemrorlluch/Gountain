const fs = require('fs');

// Version used for cache-busting
const VERSION = 'v12';

// Incluye el service worker con su nombre versionado
const filesToUpdate = ['app.js', 'index.html', 'manifest.json', 'styles.css', `sw-${VERSION}.js`];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
    // Actualiza parámetros ?v= y ocurrencias tipo v9
  content = content.replace(/v=\d+/g, `v=${VERSION.replace(/^v/, '')}`);
  content = content.replace(/v\d+/g, VERSION);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ ${file} actualizado a ${VERSION}`);
});
