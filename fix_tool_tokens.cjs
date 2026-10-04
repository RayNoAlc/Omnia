const fs = require('fs');
let code = fs.readFileSync('src/lib/routineTools.js', 'utf8');

const regexHandler = /return \{ ok: true, compromisso: saved \};/;
code = code.replace(regexHandler, 'return { ok: true, id: args.id }; // Retorno otimizado para poupar tokens');

fs.writeFileSync('src/lib/routineTools.js', code, 'utf8');
