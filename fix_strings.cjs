const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the missing $ in template literals
content = content.replace(/`\$\{item\.disciplina\} (.*?) \{item\.assunto\}`/g, '`${item.disciplina} $1 ${item.assunto}`');

// Fix the hardcoded '?' that should be bullets
content = content.replace(/\? \$\{TIPO_LABELS\[item\.tipo\]\}/g, '• ${TIPO_LABELS[item.tipo]}');
content = content.replace(/\? revis/g, '• revis');
content = content.replace(/\? estudo/g, '• estudo');

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed string interpolations and weird question marks!");
