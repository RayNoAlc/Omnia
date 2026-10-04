const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  /\{PERIODO_LABELS\[routine\.periodoPreferido\]\} \? \{routine\.duracaoPreferida/g,
  '{PERIODO_LABELS[routine.periodoPreferido]} \u2014 {routine.duracaoPreferida'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
