const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /const match = url\.match\(\/\(\?:playlist\|album\|track\|show\|episode\)\\\\\/\(\[a-zA-Z0-9\]\+\)\/\);/g,
  "const match = url.match(/(playlist|album|track|show|episode)\\/([a-zA-Z0-9]+)/);"
);

// Actually, let's just do a string replacement that works safely
tabs = tabs.replace(
  "const match = url.match(/(?:playlist|album|track|show|episode)\\//([a-zA-Z0-9]+)/);",
  "const match = url.match(/(playlist|album|track|show|episode)\\//([a-zA-Z0-9]+)/);"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed Spotify capture group!");
