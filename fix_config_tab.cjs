const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

if (ui.includes("id: 'config'")) {
  ui = ui.replace("  {\n    id: 'config',\n    label: 'Configurações',\n    icon: Settings,\n  },\n", "");
}

const configTabStr = "  { id: 'config', label: 'Configurações', icon: Settings }";
ui = ui.replace('];', configTabStr + '\n];');

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
