const fs = require('fs');
let text = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
text = text.replace(/hours\.push\(\\:00\\\);/g, 'hours.push(\\:00);');
fs.writeFileSync('src/components/Tabs.jsx', text, 'utf8');
