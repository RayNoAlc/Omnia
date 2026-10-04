const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

code = code.replace(
  'Mudanças em massa (ex: mudar cor de varias materias) -> editar_multiplos_compromissos_recorrentes.',
  'Mudanças em massa -> editar_multiplos_compromissos_recorrentes. Mudar APENAS as CORES em massa -> usar pintar_compromissos_em_massa.'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
