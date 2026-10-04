const fs = require('fs');
let c = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
console.log(c.includes('{c.disciplina} ?" {c.assunto}'));
