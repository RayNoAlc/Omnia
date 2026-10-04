const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
let idx = code.indexOf('export function AgendaTab');
console.log(code.substring(idx + 1500, idx + 2500));
