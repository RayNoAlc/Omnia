const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(/React\.useState/g, 'useState');
tabs = tabs.replace(/React\.useRef/g, 'useRef');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
