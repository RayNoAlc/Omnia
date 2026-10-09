const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /<\/div>\s*\)\s*\{openCommitment && \(/,
  '</div>\n        )}\n\n      {openCommitment && ('
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed closing brace!");
