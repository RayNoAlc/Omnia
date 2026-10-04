const fs = require('fs');
let ai = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

ai = ai.replace(/Retorne SOMENTE o array JSON .*?;/g, 'Retorne SOMENTE o array JSON (ex: [{"tipo":"prova","assunto":"P1","prazo":"2023-05-10"}]).;');

fs.writeFileSync('src/lib/aiHelpers.js', ai, 'utf8');
