const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const revComponent = `
        {/* Revisão Espaçada (Ideia 11) */}
        {(() => {
          const hoje = new Date(todayISO() + "T12:00:00Z");
          const revs = (notes||[]).filter(n => {
            if (!n.created_at || n.disciplina === "Diário de Bordo") return false;
            const diffTime = Math.abs(hoje - new Date(n.created_at));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays === 1 || diffDays === 7 || diffDays === 30 || diffDays === 90;
          });
          if (revs.length === 0) return null;
          return (
            <Card style={{ borderColor: T.brand, backgroundColor: T.brand + '11' }} className="mb-6">
              <SectionLabel><RotateCcw size={16} className="inline mr-2 -mt-0.5" /> Revisão Espaçada (Curva de Esquecimento)</SectionLabel>
              <p className="text-xs mb-3" style={{ color: T.inkSoft }}>A IA separou estas anotações (de 1, 7, 30 ou 90 dias atrás) para você revisar hoje e fixar o conteúdo a longo prazo!</p>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {revs.map(r => {
                  const d = new Date(r.created_at);
                  const daysAgo = Math.floor(Math.abs(hoje - d) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={r.id} className="min-w-[240px] max-w-[240px] snap-center rounded-lg p-3 text-sm flex flex-col justify-between" style={{ backgroundColor: T.surface, border: \`1px solid \${T.border}\` }}>
                      <div>
                        <div className="font-bold mb-1 truncate" style={{ color: T.brand }}>{r.disciplina}</div>
                        <div className="line-clamp-4 text-xs whitespace-pre-wrap" style={{ color: T.inkSoft }}>{formatTextWithTags(r.texto, T)}</div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <AudioReaderButton text={r.texto} T={T} />
                        <div className="text-[10px] font-bold uppercase text-right" style={{ color: T.ink }}>Há {daysAgo} dias</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })()}
`;

tabs = tabs.replace(
  /<div className="space-y-6 max-w-\[1400px\] mx-auto pt-2">/,
  '<div className="space-y-6 max-w-[1400px] mx-auto pt-2">\n' + revComponent
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Spaced Repetition safely!");
