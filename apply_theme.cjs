const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

if (!app.includes('applyTheme')) {
  app = app.replace(
    'import { TABS } from "./components/ui";',
    'import { TABS, applyTheme } from "./components/ui";'
  );
  
  app = app.replace(
    'const [session, setSession] = useState(undefined);',
    'const [session, setSession] = useState(undefined);\n  useEffect(() => {\n    applyTheme(localStorage.getItem("omnia-theme") || "dark");\n  }, []);'
  );
}

fs.writeFileSync('src/App.jsx', app, 'utf8');
