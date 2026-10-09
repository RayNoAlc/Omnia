const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /\(playlist\|album\|track\|show\|episode\)\\\\\/\(\[a-zA-Z0-9\]\+\)\//,
  '(playlist|album|track|show|episode)\\//([a-zA-Z0-9]+)/'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed regex escape again!");
