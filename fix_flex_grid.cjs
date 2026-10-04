const fs = require('fs');

let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /Novo<\/GhostButton>\n          <\/div>\n          <div className="overflow-x-auto/,
  'Novo</GhostButton>\n          </div>\n          </div>\n          <div className="overflow-x-auto'
);

// Also I should remove that extra </div> I added earlier before {modal === "sono" &&
tabs = tabs.replace(
  /<\/div>\n        \{modal === "sono" &&/,
  '{modal === "sono" &&'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
