const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Add BarChart to lucide-react import
if (!tabs.includes('BarChart,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  BarChart, ');
}

// Ensure the config toggle is there (we already have Gamification toggle, we can add Analytics or put it under Gamification)
// Let's add "enableAnalytics" to config
const analyticsToggleHtml = `
            <label className='flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity' style={{ borderColor: T.border, backgroundColor: T.bg }}>
              <div>
                <div className='font-bold' style={{ color: T.ink }}><BarChart size={20} className="inline mr-2 -mt-1" /> Dashboard de Análises</div>
                <div className='text-sm mt-1' style={{ color: T.inkSoft }}>Gráficos semanais e horários de pico na aba Desempenho.</div>
              </div>
              <input type='checkbox' checked={safeConfig.enableAnalytics} onChange={() => handleToggle('enableAnalytics')} className='w-6 h-6 accent-blue-500' />
            </label>
`;

tabs = tabs.replace(
  /<div className='font-bold' style=\{\{ color: T\.ink \}\}><PartyPopper size=\{20\} className="inline mr-2 -mt-1" \/> Animações de Conclusão<\/div>/,
  analyticsToggleHtml.trim() + '\n\n            <label className=\'flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity\' style={{ borderColor: T.border, backgroundColor: T.bg }}>\n              <div>\n                <div className=\'font-bold\' style={{ color: T.ink }}><PartyPopper size={20} className="inline mr-2 -mt-1" /> Animações de Conclusão</div>'
);

tabs = tabs.replace(
  /const safeConfig = \{ enableHealthBreak: true, enableScratchpad: true, enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, \.\.\.\(config \|\| \{\}\) \};/,
  'const safeConfig = { enableAnalytics: true, enableHealthBreak: true, enableScratchpad: true, enableSincereOwl: true, enableJournal: true, fontFamily: "Inter, sans-serif", enableConfetti: true, enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

// Add the logic inside DesempenhoTab
tabs = tabs.replace(
  /export function DesempenhoTab\(\{ commitments, sessions, quizAttempts, professorAttempts \}\) \{/,
  'export function DesempenhoTab({ commitments, sessions, quizAttempts, professorAttempts, config }) {'
);

const chartCode = `
    const diasSemanaMap = {"Dom":0, "Seg":0, "Ter":0, "Qua":0, "Qui":0, "Sex":0, "Sáb":0};
    const periodosMap = {"Manhã":0, "Tarde":0, "Noite":0, "Madrugada":0};
    
    sessions.forEach(s => {
      if (!s.date) return;
      const wDay = weekdayShort(s.date);
      if (diasSemanaMap[wDay] !== undefined) diasSemanaMap[wDay] += s.minutos;
      
      const hour = parseInt(s.date.split('T')[1]?.split(':')[0] || "12");
      if (hour >= 6 && hour < 12) periodosMap["Manhã"] += s.minutos;
      else if (hour >= 12 && hour < 18) periodosMap["Tarde"] += s.minutos;
      else if (hour >= 18 && hour < 24) periodosMap["Noite"] += s.minutos;
      else periodosMap["Madrugada"] += s.minutos;
    });

    const maxDia = Math.max(...Object.values(diasSemanaMap), 1);
    const picoPeriodo = Object.keys(periodosMap).reduce((a, b) => periodosMap[a] > periodosMap[b] ? a : b);
`;

tabs = tabs.replace(
  /const level = Math\.floor\(totalXp \/ 1000\) \+ 1;/,
  chartCode + '\n  const level = Math.floor(totalXp / 1000) + 1;'
);

const chartUI = `
        {/* Dashboard de Análises (Idea 49 / 25) */}
        {config?.enableAnalytics !== false && (
          <section>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: T.ink }}><BarChart className="w-5 h-5" style={{ color: T.brand }}/> Dashboard de Produtividade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gráfico da Semana */}
              <Card style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }}>
                <h4 className="text-sm font-bold mb-4" style={{ color: T.inkSoft }}>Minutos de Estudo (Total Histórico por Dia)</h4>
                <div className="flex items-end justify-between h-40 gap-2">
                  {Object.entries(diasSemanaMap).map(([dia, min]) => {
                    const hPct = Math.max((min / maxDia) * 100, 5);
                    return (
                      <div key={dia} className="flex flex-col items-center flex-1 group">
                        <div className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80 relative" style={{ height: \`\${hPct}%\`, backgroundColor: T.brand }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold transition-opacity" style={{ color: T.ink }}>{min}m</div>
                        </div>
                        <span className="text-xs mt-2" style={{ color: T.inkSoft }}>{dia}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Estatística de Pico */}
              <Card style={{ backgroundColor: T.surfaceAlt, borderColor: T.border }} className="flex flex-col justify-center items-center text-center">
                <Flame className="w-10 h-10 mb-2" style={{ color: T.brand }} />
                <h4 className="text-sm font-bold mb-1" style={{ color: T.inkSoft }}>Seu Pico de Produtividade</h4>
                <p className="text-2xl font-bold mb-2" style={{ color: T.ink }}>{picoPeriodo}</p>
                <p className="text-xs" style={{ color: T.inkSoft }}>Você estuda e foca melhor durante o período da {picoPeriodo.toLowerCase()}. Tente agendar matérias difíceis neste horário!</p>
              </Card>
            </div>
          </section>
        )}
`;

tabs = tabs.replace(
  /(\s*)<\/div>\s*\);\s*\}\s*export function BibliotecaTab/,
  '\n' + chartUI + '$1</div>\n    );\n  }\n\n  export function BibliotecaTab'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Analytics Dashboard!");
