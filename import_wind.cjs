const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /Search, Volume2, Save, MoreHorizontal, Download, LayoutDashboard, Map, Link2, BookOpen, Activity/,
  'Search, Volume2, Save, MoreHorizontal, Download, LayoutDashboard, Map, Link2, BookOpen, Activity, Wind'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Imported Wind!");
