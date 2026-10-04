const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace using generic strings
content = content.replace("Y\"s Disciplina", "📚 Disciplina");
content = content.replace("?? Essa sessǜo", "⏱️ Essa sessão");
content = content.replace("Y\"^ Total hoje", "📈 Total hoje");
content = content.replace("Sessǜo concluda", "Sessão concluída");
content = content.replace("Duraǜo", "Duração");
content = content.replace("Duraǜo", "Duração");
content = content.replace("Sessǜo livre", "Sessão livre");

fs.writeFileSync(file, content, 'utf8');
