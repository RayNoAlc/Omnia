const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /backgroundSize: "300% 100%"/,
  'backgroundSize: "300% auto"'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
