const fs = require('fs');
const content = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Find all React components used in the form <ComponentName
const matches = content.match(/<([A-Z][a-zA-Z0-9]*)/g);
if (matches) {
  const uniqueComponents = [...new Set(matches.map(m => m.slice(1)))];
  console.log("Components used:", uniqueComponents.join(', '));
}
