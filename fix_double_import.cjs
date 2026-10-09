const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Remove the bottom import
app = app.replace(/import \{ GlobalSearchModal \} from "\.\/components\/Tabs\.jsx";\n/, '');

// Add GlobalSearchModal to the top import
app = app.replace(
  /Header, TabNav, HojeTab, InboxTab, AgendaTab, DesempenhoTab,\n  BibliotecaTab, FocoTab, SecretariaTab, RotinaTab, ConfigTab,/,
  '$&\n  GlobalSearchModal,'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log("Fixed double import path!");
