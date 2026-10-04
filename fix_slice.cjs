const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  'const datasAtividades = Array.from(new Set((sessions||[]).map(s => s.data.slice(0,10)))).sort().reverse();',
  'const datasAtividades = Array.from(new Set((sessions||[]).map(s => s.data ? s.data.slice(0,10) : ""))).filter(Boolean).sort().reverse();'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
