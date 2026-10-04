const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /\{modal === "sono" &&/,
  '</div>\n        {modal === "sono" &&'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
