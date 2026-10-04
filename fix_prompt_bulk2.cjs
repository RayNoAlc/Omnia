const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const regex = /- Tabela\/grade inteira.*?(?=\n)/;
const replace = '- Tabela/grade inteira -> usar criar_multiplos_compromissos_recorrentes. Alterações em massa (ex: mudar cor de vǭrios) -> usar editar_multiplos_compromissos_recorrentes.';
code = code.replace(regex, replace);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
