const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /t === 'dark' \? 'Omnia Dark' : t === 'light' \? 'Omnia Light' : t === 'cyberpunk' \? 'Cyberpunk Neon' : 'Lo-Fi Café'/,
  "t === 'dark' ? 'Omnia Dark' : t === 'light' ? 'Omnia Light' : t === 'cyberpunk' ? 'Cyberpunk Neon' : t === 'hacker' ? 'Modo Hacker (Matrix)' : 'Lo-Fi Café'"
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Updated Theme Names in ConfigTab!");
