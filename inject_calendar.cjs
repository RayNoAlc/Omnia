const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add Calendar button
tabs = tabs.replace(
  /<button onClick=\{\(\) => setViewMode\("kanban"\)\}.*?<\/button>/,
  "$&" + '\n            <button onClick={() => setViewMode("calendario")} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "calendario" ? "bg-white dark:bg-gray-700 shadow" : "opacity-50"}`} style={{ color: viewMode === "calendario" ? T.brand : T.ink }}>Google Cal</button>'
);

// Add Calendar View Logic
const calHtml = `
        {viewMode === "calendario" ? (
          <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[700px] grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(hoje, i);
                const dayBlocks = studyBlocks.filter(b => !b.concluido && b.date === d);
                const dayComms = commitments.filter(c => !c.concluido && c.prazo === d);
                return (
                  <div key={d} className="flex flex-col gap-2">
                    <div className="text-center p-2 rounded-t-xl font-bold text-xs" style={{ backgroundColor: i === 0 ? T.brand : T.surfaceAlt, color: i === 0 ? T.brandInk : T.inkSoft }}>
                      {i === 0 ? "Hoje" : d.slice(8,10) + "/" + d.slice(5,7)}
                    </div>
                    {["manha", "tarde", "noite"].map(per => {
                      const blocks = dayBlocks.filter(b => b.periodo === per);
                      return (
                        <div key={per} className="flex flex-col gap-1 p-2 min-h-[80px] rounded-lg text-xs" style={{ backgroundColor: T.surfaceAlt, border: \`1px solid \${T.border}\` }}>
                          <span className="text-[10px] font-bold uppercase opacity-50 mb-1" style={{ color: T.ink }}>{per}</span>
                          {blocks.map(b => (
                            <div key={b.id} className="p-1 rounded cursor-pointer hover:opacity-80" style={{ backgroundColor: T.brand + '33', color: T.brand, borderLeft: \`3px solid \${T.brand}\` }} onClick={() => setOpenCommitment(commitments.find(c => c.id === b.commitment_id))}>
                              {b.assunto}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                    <div className="flex flex-col gap-1 p-2 rounded-lg text-xs mt-1" style={{ border: \`1px dashed \${T.importante}66\` }}>
                      <span className="text-[10px] font-bold uppercase mb-1" style={{ color: T.importante }}>Vence hoje</span>
                      {dayComms.length === 0 && <span className="text-[10px] opacity-40" style={{ color: T.inkSoft }}>Nada</span>}
                      {dayComms.map(c => (
                        <div key={c.id} className="p-1 rounded cursor-pointer truncate" style={{ backgroundColor: T.importante + '22', color: T.importante }} onClick={() => setOpenCommitment(c)}>
                          🔥 {c.assunto}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === "kanban" ? (
`;

tabs = tabs.replace(
  /\{viewMode === "kanban" \? \(/,
  calHtml
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Google Cal View!");
