const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

ui = ui.replace(
  /export const TIPO_LABELS = \{/,
  'export const TIPO_LABELS = {\n  fichamento: "Fichamento",'
);

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
console.log("Added Fichamento to TIPO_LABELS!");
