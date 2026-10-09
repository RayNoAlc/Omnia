const fs = require('fs');
let qa = fs.readFileSync('src/lib/qaTour.js', 'utf8');

qa = qa.replace(
  /await moveAndClick\("text=Lista", "Voltou para Lista"\);/,
  'await moveAndClick("text=Lista", "Voltou para Lista");\n  await moveAndClick("text=Google Cal", "Visualizou Bloqueio de Tempo (Calendário)");\n  await wait(2000);\n  await moveAndClick("text=Lista", "Voltou para Lista");'
);

qa = qa.replace(
  /await moveAndClick\("text=Modo Hacker", "Ativou Tema Hacker"\);/,
  'await moveAndClick("text=Modo Hacker", "Ativou Tema Hacker");\n  await wait(1000);\n  await moveAndClick("text=Modo Férias", "Ativou Modo Férias (Burnout)");\n  await wait(1500);\n  await moveAndClick("text=Modo Férias", "Desativou Modo Férias");'
);

fs.writeFileSync('src/lib/qaTour.js', qa, 'utf8');
console.log("Updated QA Tour!");
