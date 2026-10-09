const fs = require('fs');
let qa = fs.readFileSync('src/lib/qaTour.js', 'utf8');

// Update RotinaTab to click Explorar Templates
qa = qa.replace(
  /await moveAndClick\("text=Sincronizar Calendário", "Conferiu sincronização"\);/,
  '$&\n  await wait(500);\n  await moveAndClick("text=Explorar Templates", "Abriu Templates de Rotina");\n  await wait(1000);\n  await moveAndClick("text=Cancelar", "Fechou modal de Templates");'
);

fs.writeFileSync('src/lib/qaTour.js', qa, 'utf8');
console.log("Updated QA Tour with Templates!");
