const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /const horasSemana = sessoesSemana\.reduce\(\(acc, s\) => acc \+ \(s\.duration \|\| 0\), 0\) \/ 3600;/,
  'const horasSemana = sessoesSemana.reduce((acc, s) => acc + (s.minutos || 0), 0) / 60;'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed duration to minutos!");
