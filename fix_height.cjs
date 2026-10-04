const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(/const HOUR_HEIGHT = 80;/g, 'const HOUR_HEIGHT = 60;');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
