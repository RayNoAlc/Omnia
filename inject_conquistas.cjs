const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const conquistasCode = `
    const conquistas = [
      { nome: "Primeiro Passo", desc: "Começou a focar", icone: "🎉", earned: sessions.length > 0 },
      { nome: "Caminhante", desc: "Completou 5 sessões", icone: "🚶", earned: sessions.length >= 5 },
      { nome: "Mestre do Foco", desc: "Completou 50 sessões", icone: "🧠", earned: sessions.length >= 50 },
      { nome: "On Fire!", desc: "Streak de 3 dias", icone: "🔥", earned: streak >= 3 },
      { nome: "Imbatível", desc: "Streak de 7 dias", icone: "🏆", earned: streak >= 7 },
      { nome: "Sabe Tudo", desc: "Gabaritou um Quiz", icone: "💯", earned: quizAttempts.some(q => q.acertos === q.total && q.total > 0) },
      { nome: "Aprovado", desc: "Tirou 10 com o Professor", icone: "🎓", earned: professorAttempts.some(p => p.nota === 10) },
      { nome: "Organizado", desc: "Enviou 10 materiais", icone: "📚", earned: notes.length + commitments.length > 10 }
    ];
`;

tabs = tabs.replace(
  /export function DesempenhoTab\(\{ commitments, sessions, quizAttempts, professorAttempts, config \}\) \{/,
  'export function DesempenhoTab({ commitments, sessions, quizAttempts, professorAttempts, config, notes }) {'
);

tabs = tabs.replace(
  /const level = Math\.floor\(totalXp \/ 1000\) \+ 1;/,
  'const level = Math.floor(totalXp / 1000) + 1;\n' + conquistasCode
);

const conquistasHtml = `
            {/* Aba de Conquistas */}
            <section className="mt-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: T.ink }}><Target className="w-5 h-5" style={{ color: T.brand }}/> Suas Conquistas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {conquistas.map(c => (
                  <Card key={c.nome} style={{ backgroundColor: c.earned ? T.surfaceAlt : T.surface, borderColor: c.earned ? T.brand : T.border, opacity: c.earned ? 1 : 0.5 }} className="flex flex-col items-center justify-center p-4 text-center transition-all hover:scale-[1.02]">
                    <div className="text-3xl mb-2">{c.icone}</div>
                    <div className="text-sm font-bold leading-tight" style={{ color: c.earned ? T.brand : T.ink }}>{c.nome}</div>
                    <div className="text-[10px] mt-1" style={{ color: T.inkSoft }}>{c.desc}</div>
                    {!c.earned && <div className="text-[10px] font-mono mt-2" style={{ color: T.inkSoft }}><Lock className="w-3 h-3 inline -mt-0.5" /> Bloqueado</div>}
                  </Card>
                ))}
              </div>
            </section>
`;

tabs = tabs.replace(
  /\{\/\* Dashboard de Análises \(Idea 49 \/ 25\) \*\/\}/,
  conquistasHtml + '\n\n        {/* Dashboard de Análises (Idea 49 / 25) */}'
);

// We need Lock import!
if (!tabs.includes('Lock,')) {
  tabs = tabs.replace(/import \{\s*/, 'import {\n  Lock, Target, RotateCcw, ');
}

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Conquistas!");
