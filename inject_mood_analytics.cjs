const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const moodHtml = `
            {/* Histórico de Humores (Idea 22) */}
            {(() => {
              const moodNotes = (notes||[]).filter(n => n.disciplina === "Diário de Bordo" && n.texto && n.texto.includes("Humor:")).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 7);
              if (moodNotes.length === 0) return null;
              
              return (
                <section className="mb-6">
                  <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: T.inkSoft }}><Sparkles className="w-4 h-4" /> Histórico de Humor (Últimos 7 dias)</h3>
                  <div className="flex gap-2">
                    {moodNotes.map(n => {
                      const match = n.texto.match(/Humor:\\s*(.+?)\\n/);
                      const humor = match ? match[1] : "😐";
                      const dateStr = n.created_at ? new Date(n.created_at).toLocaleDateString("pt-BR", {day:'2-digit', month:'2-digit'}) : "";
                      return (
                        <div key={n.id} className="flex flex-col items-center justify-center p-2 rounded-xl" style={{ backgroundColor: T.surfaceAlt, border: \`1px solid \${T.border}\` }}>
                          <span className="text-2xl mb-1">{humor}</span>
                          <span className="text-[10px]" style={{ color: T.inkSoft }}>{dateStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()}
`;

tabs = tabs.replace(
  /\{\/\* Dashboard de Análises \(Idea 49 \/ 25\) \*\/\}/,
  moodHtml + '\n\n        {/* Dashboard de Análises (Idea 49 / 25) */}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Mood Tracker Analytics!");
