const fs = require('fs');
let code = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

code = code.replace(
  /VocǦ Ǹ um sumarizador especialista de Odontologia/g,
  "Você é um sumarizador especialista acadêmico"
);

fs.writeFileSync('src/lib/aiHelpers.js', code, 'utf8');
console.log("Fixed hardcoded subject in aiHelpers!");
