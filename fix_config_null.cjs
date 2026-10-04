const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  'const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config.enableGamification);',
  'const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config?.enableGamification);'
);

app = app.replace(
  'if (savedCfg) setConfig(JSON.parse(savedCfg));',
  'if (savedCfg) { const parsed = JSON.parse(savedCfg); if (parsed) setConfig(parsed); }'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
