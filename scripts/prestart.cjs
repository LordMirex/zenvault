const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(distIndex)) {
  console.log('[prestart] dist/index.html not found — running build...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('[prestart] Build complete.');
} else {
  console.log('[prestart] dist/index.html found — skipping build.');
}
