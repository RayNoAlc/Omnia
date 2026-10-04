const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
let rotinaNew = fs.readFileSync('rotina_temp2.jsx', 'utf8');

const rotinaRegex = /export function RotinaTab\([\s\S]*$/m;
tabs = tabs.replace(rotinaRegex, rotinaNew);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
