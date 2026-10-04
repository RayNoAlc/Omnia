const fs = require('fs');
let ui = fs.readFileSync('src/components/ui.jsx', 'utf8');

ui = ui.replace(
  /purple: 'var\(--purple\)', pink: 'var\(--pink\)'/,
  "purple: 'var(--purple)', pink: 'var(--pink)', brandInk: 'var(--brandInk)'"
);

fs.writeFileSync('src/components/ui.jsx', ui, 'utf8');
