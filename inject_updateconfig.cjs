const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace(
  'const [tab, setTab] = useState("hoje");',
  'const [tab, setTab] = useState("hoje");\n  const updateConfig = (newCfg) => { setConfig(newCfg); localStorage.setItem("omnia_config", JSON.stringify(newCfg)); };'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
