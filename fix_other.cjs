const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<SectionLabel>Dura.*?<\/SectionLabel>/g, '<SectionLabel>Duração</SectionLabel>');
content = content.replace(/Sess.*?o livre/g, 'Sessão livre');
content = content.replace(/Esperando voc.*?estudar/g, 'Esperando você estudar');
content = content.replace(/Semin.*?rio/g, 'Seminário');
content = content.replace(/Cr.*?tico/g, 'Crítico');
content = content.replace(/Mestre da Rotina/g, 'Mestre da Rotina'); // just in case

fs.writeFileSync(file, content, 'utf8');
