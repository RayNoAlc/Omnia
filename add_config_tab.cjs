const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

if (!ui.includes('Settings')) {
  ui = ui.replace('import { Home', 'import { Settings, Home');
}

const configTabDef = "  {\n    id: 'config',\n    label: 'Configurações',\n    icon: Settings,\n  },\n";

if (!ui.includes("id: 'config'")) {
  ui = ui.replace('export const TABS = [', 'export const TABS = [\n' + configTabDef);
  // Wait, I should put it at the bottom to be discreet.
  // Actually replacing export const TABS = [ and putting it at the end is better.
}

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
