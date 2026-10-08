const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /timer\.remaining % 1200 === 0 && timer\.remaining > 0 && timer\.remaining < timer\.duration/,
  'timer.remaining % 1200 === 0 && timer.remaining > 0 && timer.remaining < (timer.workSeconds || 999999)'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed timer duration check!");
