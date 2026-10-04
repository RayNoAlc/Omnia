const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace("export function RotinaTab({,  routine", "export function RotinaTab({ routine");
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
