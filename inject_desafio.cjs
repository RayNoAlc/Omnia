const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const desafioHtml = `
            {/* Desafio Semanal (Idea 26) */}
            {(() => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              const isoweekAgo = weekAgo.toISOString().slice(0,10);
              const sessoesSemana = (sessions||[]).filter(s => s.date && s.date >= isoweekAgo);
              const horasSemana = sessoesSemana.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;
              const metaSemana = 10;
              const percent = Math.min(100, Math.round((horasSemana / metaSemana) * 100));
              const concluido = horasSemana >= metaSemana;

              return (
                <section className="mt-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: T.ink }}><Target className="w-5 h-5" style={{ color: T.brand }}/> Desafio da Semana</h3>
                  <Card style={{ backgroundColor: concluido ? T.surfaceAlt : T.surface, borderColor: concluido ? T.brand : T.border }} className="p-4 relative overflow-hidden">
                    {concluido && <div className="absolute -right-4 -top-4 text-6xl opacity-10">🏆</div>}
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="font-bold" style={{ color: concluido ? T.brand : T.ink }}>10 Horas de Foco Profundo</div>
                        <div className="text-xs" style={{ color: T.inkSoft }}>{concluido ? "Desafio superado! Descanse." : "Concentre-se por 10 horas nesta semana para ganhar a recompensa."}</div>
                      </div>
                      <div className="text-2xl font-mono" style={{ color: T.brand }}>{horasSemana.toFixed(1)}<span className="text-sm">/10h</span></div>
                    </div>
                    <div className="h-2 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: T.border }}>
                      <div className="h-full transition-all duration-1000" style={{ width: \`\${percent}%\`, backgroundColor: T.brand }}></div>
                    </div>
                  </Card>
                </section>
              );
            })()}
`;

tabs = tabs.replace(
  /\{\/\* Aba de Conquistas \*\/\}/,
  desafioHtml + '\n\n            {/* Aba de Conquistas */}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Desafio Semanal!");
