const fs = require('fs');
let code = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Change the instructions to use pintar_materia_pelo_nome
code = code.replace(
  'Para mudar a cor de varias materias, voce DEVE chamar a ferramenta pintar_compromisso MULTIPLAS VEZES em paralelo (uma vez para cada materia).',
  'Para mudar a cor de materias/disciplinas inteiras, chame a ferramenta pintar_materia_pelo_nome passando o NOME da materia.'
);

// We still need to give the AI the list of IDs if the user wants to rename or change the time of a SPECIFIC block (editar_compromisso_recorrente).
// BUT we can just pass a much shorter list or just say "Para alterar horario, peça o ID ao usuario".
// But let's just keep the short mapping. We already did `${b.id}|${b.titulo}`.

// Let's modify the early exit logic in Tabs.jsx for the new tool name
code = code.replace(
  'if (call.function.name === "pintar_compromisso") hasPintar = true;',
  'if (call.function.name === "pintar_materia_pelo_nome") hasPintar = true;'
);

fs.writeFileSync('src/components/Tabs.jsx', code, 'utf8');
