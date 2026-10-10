const fs = require('fs');
let cfg = fs.readFileSync('vite.config.js', 'utf8');
cfg = cfg.replace(/build: \{ minify: false \},\n  /, '');
fs.writeFileSync('vite.config.js', cfg, 'utf8');
console.log("Minification restored!");
