import fs from 'fs';

// Lee versión de config.js
const { VERSION } = await import(`./config.js?${Date.now()}`);

const filesToUpdate = ['app.js', 'index.html', 'manifest.json', 'styles.css'];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/v\d+/g, VERSION);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ ${file} actualizado a ${VERSION}`);
});
