const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  'backgroundColor: "#0B1120"',
  'backgroundColor: T.surface'
);

tabs = tabs.replace(
  'borderColor: "rgba(128,128,128,0.1)"',
  'borderColor: T.border'
);
tabs = tabs.replace(
  'borderColor: "rgba(128,128,128,0.1)"',
  'borderColor: T.border'
); // Run twice just in case there are multiple lines

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
