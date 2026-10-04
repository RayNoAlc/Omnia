const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Filter TABS
app = app.replace(
  '<AppLayout activeTab={tab} onTabChange={setTab} TABS={TABS}',
  'const visibleTabs = TABS.filter(t => t.id !== "desempenho" || config.enableGamification);\n    return (\n    <AppLayout activeTab={tab} onTabChange={setTab} TABS={visibleTabs}'
);

// Add ConfigTab import
app = app.replace(
  'BibliotecaTab, FocoTab, SecretariaTab, RotinaTab,',
  'BibliotecaTab, FocoTab, SecretariaTab, RotinaTab, ConfigTab,'
);

// Add ConfigTab route
app = app.replace(
  '{tab === "rotina" && (',
  '{tab === "config" && <ConfigTab config={config} updateConfig={updateConfig} />}\n            {tab === "rotina" && ('
);

// Pass config to RotinaTab and FocoTab
app = app.replace(
  '<RotinaTab routine=',
  '<RotinaTab config={config} routine='
);
app = app.replace(
  '<FocoTab timer=',
  '<FocoTab config={config} timer='
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
