const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  '    return (\n    const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config.enableGamification);\n    return (\n    <AppLayout',
  '    const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config.enableGamification);\n    return (\n    <AppLayout'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
