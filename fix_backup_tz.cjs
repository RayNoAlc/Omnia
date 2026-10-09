const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /new Date\(\)\.toISOString\(\)\.slice\(0,10\)/,
  'todayISO()'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed backup filename tz!");
