const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

if (!app.includes('const [config, setConfig]')) {
  app = app.replace(
    'const [session, setSession] = useState(undefined);',
    'const [session, setSession] = useState(undefined);\n  const [config, setConfig] = useState({ enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true });'
  );
  
  app = app.replace(
    'applyTheme(localStorage.getItem("omnia-theme") || "dark");',
    'applyTheme(localStorage.getItem("omnia-theme") || "dark");\n    const savedCfg = localStorage.getItem("omnia_config");\n    if (savedCfg) setConfig(JSON.parse(savedCfg));'
  );
  
  const updateConfigFn = "const updateConfig = (newCfg) => { setConfig(newCfg); localStorage.setItem('omnia_config', JSON.stringify(newCfg)); };\n";
  
  app = app.replace(
    'const handleTabChange = (t) => { setTab(t); };',
    'const handleTabChange = (t) => { setTab(t); };\n  ' + updateConfigFn
  );
}

fs.writeFileSync('src/App.jsx', app, 'utf8');
