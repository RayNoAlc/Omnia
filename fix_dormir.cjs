const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  /\{routine\.dormir\} [^\{]+ \{routine\.acordar\}/g,
  '{routine.dormir} \u2014 {routine.acordar}'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
