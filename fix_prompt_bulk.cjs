const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  'Tabela/grade inteira ǽ??T usar criar_multiplos_compromissos_recorrentes com TODOS de uma vez.',
  'Tabela/grade inteira -> usar criar_multiplos_compromissos_recorrentes com TODOS de uma vez.\\n  - Alterações em massa (ex: pintar dezenas de aulas) -> usar editar_multiplos_compromissos_recorrentes.'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
