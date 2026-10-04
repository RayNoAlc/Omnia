const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldBlock = /<SectionLabel>.*?conclu.*?<\/SectionLabel>\s*<div className="space-y-1 text-sm">\s*<div className="flex justify-between"><span style={{ color: T\.inkSoft }}>.*?Disciplina<\/span><span style={{ color: T\.ink }}>\{ultimaSessao\.disciplina\}<\/span><\/div>\s*<div className="flex justify-between"><span style={{ color: T\.inkSoft }}>.*?sess.*?<\/span><span style={{ color: T\.ink }}>\{ultimaSessao\.minutos\} min<\/span><\/div>\s*<div className="flex justify-between"><span style={{ color: T\.inkSoft }}>.*?Total hoje<\/span><span style={{ color: T\.ink }}>\{totalHoje\} min<\/span><\/div>/;

const newBlock = `<SectionLabel>Sessão concluída</SectionLabel>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span style={{ color: T.inkSoft }}>📚 Disciplina</span><span style={{ color: T.ink }}>{ultimaSessao.disciplina}</span></div>
              <div className="flex justify-between"><span style={{ color: T.inkSoft }}>⏱️ Essa sessão</span><span style={{ color: T.ink }}>{ultimaSessao.minutos} min</span></div>
              <div className="flex justify-between"><span style={{ color: T.inkSoft }}>📈 Total hoje</span><span style={{ color: T.ink }}>{totalHoje} min</span></div>`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(file, content, 'utf8');
console.log("Block replaced!");
