const fs = require('fs');
let codeTools = fs.readFileSync('src/lib/routineTools.js', 'utf8');

// Remover a ferramenta editar_multiplos_compromissos_recorrentes do array ROUTINE_TOOLS
const regexRemoveTool = /\{\s*type: "function",\s*function: \{\s*name: "editar_multiplos_compromissos_recorrentes"[\s\S]*?\}\s*\}\s*\},/;
codeTools = codeTools.replace(regexRemoveTool, '');

// Remover o handler editar_multiplos_compromissos_recorrentes do switch
const regexRemoveHandler = /case "editar_multiplos_compromissos_recorrentes": \{[\s\S]*?return \{ ok: editados\.length > 0, editados: editados\.length, erros: erros\.length > 0 \? erros : null \};\s*\}/;
codeTools = codeTools.replace(regexRemoveHandler, '');

fs.writeFileSync('src/lib/routineTools.js', codeTools, 'utf8');

let codeTabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

codeTabs = codeTabs.replace(
  'Mudanças em massa -> editar_multiplos_compromissos_recorrentes. Mudar cores de vários -> chame a ferramenta pintar_compromisso MULTIPLAS VEZES de uma s vez (em paralelo).',
  'Para mudar a cor de varias materias, voce DEVE chamar a ferramenta pintar_compromisso MULTIPLAS VEZES em paralelo (uma vez para cada materia).'
);
// Try fallback replace if encoding failed
codeTabs = codeTabs.replace(
  /Mudanças em massa -> editar_multiplos_compromissos_recorrentes.*?\(em paralelo\)\./g,
  'Para mudar a cor de varias materias, voce DEVE chamar a ferramenta pintar_compromisso MULTIPLAS VEZES em paralelo (uma vez para cada materia).'
);

fs.writeFileSync('src/components/Tabs.jsx', codeTabs, 'utf8');
