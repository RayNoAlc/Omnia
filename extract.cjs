const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
const rotinaRegex = /export function RotinaTab\([\s\S]*?\n\}\n/m;
const rotinaCode = tabs.match(rotinaRegex)[0];

fs.writeFileSync('rotina_temp.txt', rotinaCode, 'utf8');
