const fs = require('fs');
let text = fs.readFileSync('src/components/Tabs.jsx', 'utf8');
text = text.replace(/Pr.*?ximos Prazos e Tarefas/g, 'Próximos Prazos e Tarefas');
text = text.replace(/ðŸ“Œ/g, '📌');
text = text.replace(/â€“/g, '—');
fs.writeFileSync('src/components/Tabs.jsx', text, 'utf8');
