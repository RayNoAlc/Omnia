const fs = require('fs');

let appLayout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
appLayout = appLayout.replace(/""Yellowtail", cursive"/g, "'Yellowtail', cursive");
fs.writeFileSync('src/layouts/AppLayout.jsx', appLayout, 'utf8');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
tabs = tabs.replace(/""Yellowtail", cursive"/g, "'Yellowtail', cursive");
fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
