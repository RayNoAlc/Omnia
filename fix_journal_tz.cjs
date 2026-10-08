const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  /const jaPreencheuHoje = notes\.some\(n => n\.disciplina === "Diário de Bordo" && n\.created_at\?\.startsWith\(hojeDateStr\)\);/,
  'const jaPreencheuHoje = notes.some(n => n.disciplina === "Diário de Bordo" && n.created_at && new Date(n.created_at).toLocaleDateString("sv-SE") === hojeDateStr);'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Fixed Journal timezone bug!");
