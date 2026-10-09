const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /const today = new Date\(\)\.toISOString\(\)\.slice\(0, 10\);/,
  'const today = todayISO();' // We already import todayISO at the top of Tabs.jsx!
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed DailyHabits to use todayISO!");
