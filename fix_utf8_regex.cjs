const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// Using brute force search and replace for corrupted sections
content = content.replace(/<SectionLabel>Sess.*?conclu.*?da<\/SectionLabel>/g, '<SectionLabel>Sessão concluída</SectionLabel>');
content = content.replace(/<span style={{ color: T.inkSoft }}>.*? Disciplina<\/span>/g, '<span style={{ color: T.inkSoft }}>📚 Disciplina</span>');
content = content.replace(/<span style={{ color: T.inkSoft }}>.*? Essa sess.*?<\/span>/g, '<span style={{ color: T.inkSoft }}>⏱️ Essa sessão</span>');
content = content.replace(/<span style={{ color: T.inkSoft }}>.*? Total hoje<\/span>/g, '<span style={{ color: T.inkSoft }}>📈 Total hoje</span>');
content = content.replace(/<SectionLabel>Dura.*?o<\/SectionLabel>/g, '<SectionLabel>Duração</SectionLabel>');
content = content.replace(/Sess.*?o livre/g, 'Sessão livre');
content = content.replace(/Esperando voc.*? estudar/g, 'Esperando você estudar');

fs.writeFileSync(file, content, 'utf8');

file = 'src/components/ui.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/Semin.*?rio/g, 'Seminário');
content = content.replace(/Cr.*?tico/g, 'Crítico');
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed manually!");
