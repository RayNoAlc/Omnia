const fs = require('fs');
let cfg = fs.readFileSync('vite.config.js', 'utf8');
cfg = cfg.replace(/plugins: \[/, 'build: { minify: false },\n  plugins: [');
fs.writeFileSync('vite.config.js', cfg, 'utf8');
