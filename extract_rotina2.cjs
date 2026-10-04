const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
const rotinaRegex = /export function RotinaTab\([\s\S]*$/m;
const match = tabs.match(rotinaRegex);
if (match) {
    fs.writeFileSync('rotina_temp.jsx', match[0], 'utf8');
}
