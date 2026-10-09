const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const academicHtml = `
            {/* Desempenho Acadêmico (Idea 12) */}
            <section className="mb-6">
              <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: T.inkSoft }}><GraduationCap className="w-4 h-4" /> Desempenho Acadêmico</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const mediaQuiz = quizAttempts && quizAttempts.length > 0 
                    ? Math.round(quizAttempts.reduce((acc, q) => acc + (q.acertos / (q.total || 1)), 0) / quizAttempts.length * 100) 
                    : 0;
                  const mediaProf = professorAttempts && professorAttempts.length > 0
                    ? Math.round(professorAttempts.reduce((acc, p) => acc + (p.nota || 0), 0) / professorAttempts.length * 10)
                    : 0;
                  
                  return (
                    <>
                      <Card style={{ backgroundColor: T.surface, borderColor: T.border }} className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: T.surfaceAlt, color: T.brand }}>
                          📝
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: T.inkSoft }}>Média Quizzes</div>
                          <div className="text-2xl font-mono" style={{ color: T.ink }}>{mediaQuiz > 0 ? \`\${mediaQuiz}%\` : '--'}</div>
                          <div className="text-[10px]" style={{ color: T.inkSoft }}>{quizAttempts?.length || 0} resolvidos</div>
                        </div>
                      </Card>
                      <Card style={{ backgroundColor: T.surface, borderColor: T.border }} className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: T.surfaceAlt, color: T.brand }}>
                          🎓
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: T.inkSoft }}>Média Modo Professor</div>
                          <div className="text-2xl font-mono" style={{ color: T.ink }}>{mediaProf > 0 ? \`\${mediaProf}%\` : '--'}</div>
                          <div className="text-[10px]" style={{ color: T.inkSoft }}>{professorAttempts?.length || 0} avaliações</div>
                        </div>
                      </Card>
                    </>
                  );
                })()}
              </div>
            </section>
`;

tabs = tabs.replace(
  /\{\/\* Dashboard de Análises \(Idea 49 \/ 25\) \*\/\}/,
  academicHtml + '\n\n        {/* Dashboard de Análises (Idea 49 / 25) */}'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
console.log("Injected Academic Performance!");
