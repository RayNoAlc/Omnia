const fs = require('fs');
let qa = fs.readFileSync('src/lib/qaTour.js', 'utf8');

// In FocoTab
qa = qa.replace(
  /await moveAndClick\("text=Técnica de Respiração \(Ansiedade\)", "Testou Box Breathing"\);/,
  '$&\n  await wait(500);\n  await moveAndClick("text=☕ Café", "Mudou som ambiente para Café (Sons Dinâmicos)");'
);

// In HojeTab
qa = qa.replace(
  /await moveAndClick\("text=Tentar novamente", "Conferiu modo Offline"\);/,
  '$&\n  await wait(500);\n  await moveAndClick("text=💧 Beber Água (2L)", "Marcou hábito de Beber Água");\n  await wait(500);\n  await moveAndClick("text=🏃 Atividade Física", "Marcou hábito de Exercício");'
);

fs.writeFileSync('src/lib/qaTour.js', qa, 'utf8');
console.log("Updated QA Tour with Habits and Sounds!");
