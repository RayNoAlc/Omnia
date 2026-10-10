const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const diarioStart = `        {/* Diário de Bordo (Idea 36 & 38) */}`;
const diarioEnd = `          </div>\n        )}\n`;

const sIndex = code.indexOf(diarioStart);
const eIndex = code.indexOf(diarioEnd, sIndex) + diarioEnd.length;

const block = code.substring(sIndex, eIndex);

code = code.replace(block, '');

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
fs.writeFileSync('diario_block.txt', block, 'utf8');
