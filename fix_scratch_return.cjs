const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /return \(\s*const \[scratch, setScratch\] = useState/,
  'const [scratch, setScratch] = useState'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed Scratchpad return block!");
