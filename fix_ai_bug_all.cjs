const fs = require('fs');
let code = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

code = code.replace(/de Odontologia/g, "acadêmico/universitário");
code = code.replace(/em um curso de Odontologia/g, "em um curso de graduação");
code = code.replace(/para estudantes de Odontologia/g, "para estudantes universitários");
code = code.replace(/para Odontologia/g, "acadêmico");

fs.writeFileSync('src/lib/aiHelpers.js', code, 'utf8');
console.log("Fixed ALL hardcoded Odontologia references!");
