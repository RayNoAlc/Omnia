const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const targetStr = 'Tabela/grade inteira ';
const idx = code.indexOf(targetStr);
if (idx > -1) {
    const endLine = code.indexOf('\\n', idx);
    const originalLine = code.substring(idx, endLine);
    code = code.replace(originalLine, 'Tabela/grade inteira -> criar_multiplos_compromissos_recorrentes. Mudanças em massa (ex: mudar cor de varias materias) -> editar_multiplos_compromissos_recorrentes.');
    fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
}
