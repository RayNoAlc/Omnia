const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Remove the new one I just added
app = app.replace(/import \{ T, TABS \} from "\.\/components\/ui";\n/, '');

// Add T to the existing one
app = app.replace(
  /import \{ TABS, applyTheme \} from "\.\/components\/ui";/,
  'import { T, TABS, applyTheme } from "./components/ui";'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Merged T into the existing ui import!");
