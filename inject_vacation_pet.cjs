const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

let parts = tabs.split('else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }');
if (parts.length > 1) {
  tabs = parts[0] + 'else if (config?.vacationMode) { position = "0%"; status = "De Férias 🌴"; }\n  else if (streak > 5) { position = "100%"; status = "Mestre da Rotina"; }' + parts[1];
  console.log("Injected pet status");
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
