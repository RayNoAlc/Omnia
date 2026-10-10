const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

if (!app.includes('import { T, TABS } from "./components/ui";')) {
  app = app.replace(
    /import \{ Loader2 \} from "lucide-react";/,
    'import { Loader2 } from "lucide-react";\nimport { T, TABS } from "./components/ui";'
  );
  fs.writeFileSync('src/App.jsx', app, 'utf8');
  console.log("Added missing T and TABS imports!");
}
