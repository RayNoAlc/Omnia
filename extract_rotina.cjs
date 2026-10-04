const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const rotinaRegex = /export function RotinaTab\([\s\S]*?\n\}\n/m;
const match = tabs.match(rotinaRegex);

if (match) {
    fs.writeFileSync('src/components/tabs/RotinaTab.jsx', match[0], 'utf8');
    console.log('Extracted RotinaTab');
}
