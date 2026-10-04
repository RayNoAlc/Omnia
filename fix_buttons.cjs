const fs = require('fs');
let c = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
c = c.replace(/className="w-full text-left"/g, 'className="w-full text-left rounded-lg outline-none focus:outline-none overflow-hidden bg-transparent"');
fs.writeFileSync('src/components/Tabs.jsx', c, 'utf8');
