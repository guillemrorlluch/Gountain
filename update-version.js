// update-version.js
const fs = require('fs');
const path = require('path');
const { VERSION } = require('./config');

// Archivos donde quieres reemplazar la versión
const files = [
  'index.html',
  'manifest.json',
  'styles.css',
  'app.js',
  'sw-v7.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplaza todas las versiones antiguas por la nueva
    content = content.replace(/v\d+/g, VERSION);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado ${file} a ${VERSION}`);
  } else {
    console.warn(`⚠️ No se encontró ${file}`);
  }
});

console.log(`\n🚀 Versión actualizada a ${VERSION} en todos los archivos listados.`);
