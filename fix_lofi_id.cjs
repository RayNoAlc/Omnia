const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Replace the broken livestream ID with a static 1-hour lofi compilation video that won't break
tabs = tabs.replace("jfKfPfyJRdk", "lTRiuFIWV54");

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
