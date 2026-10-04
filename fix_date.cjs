const fs = require('fs');
let c = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

c = c.replace(/\{formatDateBR\(c\.prazo\)\}.*?\{weekdayShort\(c\.prazo\)\}/g, '{formatDateBR(c.prazo)} • {weekdayShort(c.prazo)}');

fs.writeFileSync('src/components/Tabs.jsx', c, 'utf8');
