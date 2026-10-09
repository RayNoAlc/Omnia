const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const kanbanToggle = `
    const [viewMode, setViewMode] = useState("lista"); // "lista" | "kanban"
`;

tabs = tabs.replace(
  /const \[openCommitment, setOpenCommitment\] = useState\(null\);/,
  'const [openCommitment, setOpenCommitment] = useState(null);\n' + kanbanToggle
);

const renderKanban = `
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setViewMode("lista")} className={\`px-3 py-1 text-xs font-bold rounded-md transition-all \${viewMode === "lista" ? "bg-white dark:bg-gray-700 shadow" : "opacity-50"}\`} style={{ color: viewMode === "lista" ? T.brand : T.ink }}>Lista</button>
            <button onClick={() => setViewMode("kanban")} className={\`px-3 py-1 text-xs font-bold rounded-md transition-all \${viewMode === "kanban" ? "bg-white dark:bg-gray-700 shadow" : "opacity-50"}\`} style={{ color: viewMode === "kanban" ? T.brand : T.ink }}>Kanban</button>
          </div>
        </div>

        {viewMode === "kanban" ? (
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 items-start">
            {["A Fazer", "Atrasados", "Concluídos"].map(col => {
              let items = [];
              if (col === "A Fazer") items = commitments.filter(c => !c.concluido && (!c.prazo || c.prazo >= hoje));
              else if (col === "Atrasados") items = commitments.filter(c => !c.concluido && c.prazo && c.prazo < hoje);
              else if (col === "Concluídos") items = commitments.filter(c => c.concluido);
              
              return (
                <div key={col} className="flex-1 min-w-[280px] rounded-xl p-3" style={{ backgroundColor: T.surfaceAlt, border: \`1px solid \${T.border}\` }}>
                  <div className="font-bold text-sm mb-3 px-1 flex justify-between items-center" style={{ color: T.inkSoft }}>
                    {col} <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(c => (
                      <Card key={c.id} className="cursor-pointer hover:border-blue-500 transition-colors p-3" onClick={() => setOpenCommitment(c)}>
                        <div className="text-[10px] font-bold uppercase mb-1" style={{ color: T.brand }}>{c.disciplina}</div>
                        <div className="text-sm font-medium leading-snug mb-2">{c.assunto}</div>
                        {c.prazo && <div className="text-xs" style={{ color: col === "Atrasados" ? T.critico : T.inkSoft }}>{formatDateBR(c.prazo)}</div>}
                      </Card>
                    ))}
                    {items.length === 0 && <div className="text-xs text-center py-4 italic opacity-50">Vazio</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
`;

tabs = tabs.replace(
  /<PlanosAtivos commitments=\{commitments\} studyBlocks=\{studyBlocks\} onReplan=\{onReplan\} onReduzir=\{onReduzir\} \/>/,
  '<PlanosAtivos commitments={commitments} studyBlocks={studyBlocks} onReplan={onReplan} onReduzir={onReduzir} />\n' + renderKanban
);

tabs = tabs.replace(
  /<\/div>\s*\}\s*\{openCommitment && \(/,
  '</div>\n        )}\n\n      {openCommitment && ('
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Kanban!");
